const { reapplicationState, rejectionUpdate } = require('../services/instructorReapplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { streamInstructorDocument } = require('../utils/instructorDocumentStream');
exports.list=async(req,res,next)=>{try{const allowed=['pending','approved','changes_requested','rejected'];const status=allowed.includes(req.query.status)?req.query.status:'pending';const instructors=await User.find({role:'instructor','instructorVerification.status':status}).select('firstName lastName email instructorVerification').sort('instructorVerification.submittedAt');res.json({success:true,data:{instructors}})}catch(e){next(e)}};
exports.get=async(req,res,next)=>{try{const instructor=await User.findOne({_id:req.params.id,role:'instructor'}).select('firstName lastName email instructorVerification').populate('instructorVerification.reviewedBy','firstName lastName');if(!instructor)return res.status(404).json({success:false,message:'Instructor application not found'});res.json({success:true,data:{instructor,reapplication:reapplicationState(instructor.instructorVerification)}})}catch(e){next(e)}};
exports.review = async (req, res, next) => {
    try {
        const status = req.body.status;
        const message = String(req.body.message || '').trim();
        if (!['approved', 'rejected', 'changes_requested'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid review decision' });
        if ((status !== 'approved' && !message) || message.length > 1000) return res.status(400).json({ success: false, message: 'Provide a reason of at most 1000 characters.' });
        const instructor = await User.findOne({ _id: req.params.id, role: 'instructor' });
        if (!instructor) return res.status(404).json({ success: false, message: 'Instructor application not found' });
        const v = instructor.instructorVerification;
        if (instructor._id.equals(req.user._id)) return res.status(403).json({ success: false, message: 'You cannot review your own application' });
        if (v.status !== 'pending') return res.status(409).json({ success: false, message: 'Only pending applications can be reviewed.' });
        if (status === 'approved' && (!v.emailVerified || !v.organization || !v.expertise || !v.qualification || v.experienceYears == null || !v.bio || !v.resumeDocument?.storageId || !v.proofDocument?.storageId)) return res.status(400).json({ success: false, message: 'Email verification, professional details, resume and proof are required.' });
        const now = new Date();
        const state = reapplicationState(v, now);
        if (status === 'rejected' && state.rejectionCount >= 2 && req.body.confirmFinalRejection !== true) {
            return res.status(409).json({ success: false, code: 'FINAL_REJECTION_CONFIRMATION_REQUIRED', message: 'This rejection will lock reapplication for 30 days. Confirm the final rejection to continue.' });
        }
        const set = {
            'instructorVerification.status': status, 'instructorVerification.adminMessage': message,
            'instructorVerification.reviewedBy': req.user._id, 'instructorVerification.reviewedAt': now,
        };
        const update = { $set: set };
        if (status === 'rejected') {
            const rejection = rejectionUpdate(v, req.user._id, message, now);
            for (const field of ['rejectionCount', 'rejectionWindowStartedAt', 'lastRejectedAt', 'reapplyAvailableAt']) set[`instructorVerification.${field}`] = rejection[field];
            update.$push = { 'instructorVerification.rejectionHistory': rejection.event };
        }
        const updated = await User.findOneAndUpdate({ _id: instructor._id, 'instructorVerification.status': 'pending', 'instructorVerification.submittedAt': v.submittedAt || null }, update, { new: true, runValidators: true });
        if (!updated) return res.status(409).json({ success: false, message: 'Application was already reviewed. Refresh and try again.' });
        const messages = { approved: 'Your instructor application has been approved.', changes_requested: 'Changes have been requested for your instructor application.', rejected: 'Your instructor application was not approved.' };
        await Notification.create({ user: instructor._id, title: messages[status], message: message || messages[status], type: status === 'approved' ? 'success' : 'warning', link: '/instructor/verification' });
        res.json({ success: true, data: { instructor: updated } });
    } catch (error) { next(error); }
};
exports.document=async(req,res,next)=>{try{const kind=req.params.kind;if(!['resume','proof'].includes(kind))return res.status(400).json({success:false,message:'Invalid document type'});const u=await User.findOne({_id:req.params.id,role:'instructor'});const d=kind==='resume'?u?.instructorVerification?.resumeDocument:u?.instructorVerification?.proofDocument;if(!d?.storageId)return res.status(404).json({success:false,message:'Document not found'});streamInstructorDocument(res,d,next)}catch(e){next(e)}};