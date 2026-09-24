require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const legacyKey = ['tea', 'cher'].join('');

async function migrate() {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
    await mongoose.connect(process.env.MONGO_URI);
    const users = mongoose.connection.collection('users');
    const courses = mongoose.connection.collection('courses');

    const legacyUsers = await users.updateMany(
        { role: legacyKey },
        {
            $set: {
                role: 'instructor',
            },
        }
    );

    const ownershipChanges = [];
    const cursor = courses.find({ [legacyKey]: { $exists: true } });
    for await (const course of cursor) {
        const update = { $unset: { [legacyKey]: '' } };
        if (!course.instructor && course[legacyKey]) update.$set = { instructor: course[legacyKey] };
        ownershipChanges.push({ updateOne: { filter: { _id: course._id }, update } });
    }
    const courseResult = ownershipChanges.length ? await courses.bulkWrite(ownershipChanges, { ordered: true }) : null;

    console.log(JSON.stringify({
        usersMatched: legacyUsers.matchedCount,
        usersMigrated: legacyUsers.modifiedCount,
        coursesMatched: ownershipChanges.length,
        coursesMigrated: courseResult?.modifiedCount || 0,
    }));
}

migrate().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());