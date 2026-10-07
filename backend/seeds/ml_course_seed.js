require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const User = require('../models/User');

const PLAYLIST_ID = 'PLBlnK6fEyqRi-VHKpqEQNIjotoP-e9lht';
const COURSE_CODE = 'ML101';

const videos = [
    ['Machine Learning (ML) - Course Announcement', 'cirBGMibmUQ', 'Course Orientation'],
    ['Introduction to Machine Learning', 'RCnjK7nLiVA', 'Foundations'],
    ['History of Machine Learning', '_jaV6DKFEg8', 'Foundations'],
    ['Well-Defined Learning Problem', 'i166ywHK88Q', 'Foundations'],
    ['Machine Learning Model', 'YRT2zEk4m6k', 'Foundations'],
    ['Dataset Fundamentals', 'dO3kbqdi-zk', 'Data and Problem Definition'],
    ['Data Splitting', '7PpeE8YlnPM', 'Data and Problem Definition'],
    ['Performance Concepts in Machine Learning', '7O0UCjfbl2o', 'Data and Problem Definition'],
    ['Machine Learning Pipeline', 'RpRcEh1GOCE', 'Data and Problem Definition'],
    ['Problem Definition and Data Collection in ML', '4hmOH3ib_Fc', 'Data and Problem Definition'],
    ['Data Cleaning in ML', 'GyVsmzOatUs', 'Data Preparation'],
    ['Train-Test Split in ML', 'AGmOIsTdCWs', 'Data Preparation'],
    ['Data Preprocessing in ML', 'HmneufrBDuY', 'Data Preparation'],
    ['Data Preprocessing in ML - Practical', 'Q7DTR5AwphA', 'Data Preparation'],
    ['Feature Engineering in ML', 'ehVDNOYr8L0', 'Data Preparation'],
    ['Selecting a Machine Learning Algorithm', 'CrZu-HAvEhI', 'Model Building'],
    ['Training a Machine Learning Model', 'zWE87wFrk9g', 'Model Building'],
    ['Model Evaluation in Machine Learning', '4M6buGsdhRQ', 'Model Evaluation'],
];

const notes = [
    ['Course Orientation', 'Machine Learning Course Notes', [
        'This course introduces the machine learning workflow from problem definition through model evaluation.',
        'Use the videos in order. Complete the Foundations Quiz after the introductory lessons.',
        'Key habit: state the task, identify the available experience, and choose a measurable performance goal before selecting an algorithm.',
    ]],
    ['Foundations', 'Machine Learning Foundations Notes', [
        'Machine learning allows a system to learn patterns from examples instead of relying only on hand-written rules.',
        'A well-defined learning problem specifies the task, the experience or data, and the performance measure.',
        'A model is a learned representation or function that maps inputs to useful predictions or decisions.',
        'Important vocabulary: examples, features, target, training, prediction, generalization, and performance measure.',
    ]],
    ['Data and Problem Definition', 'Data and Problem Definition Notes', [
        'Start by identifying the real-world decision the system must support and the prediction target.',
        'Collect data that represents the situations in which the model will be used.',
        'A dataset contains examples. Each example may include input features and, for supervised learning, a target label.',
        'A machine learning pipeline turns a defined problem and collected data into a trained and evaluated model.',
        'Choose metrics that reflect the cost of errors and the actual goal of the application.',
    ]],
    ['Data Preparation', 'Data Preparation Notes', [
        'Clean data by handling missing values, invalid records, inconsistent formats, duplicates, and obvious errors.',
        'Split data into training and test sets before fitting preprocessing steps or models.',
        'Training data is used to learn. Test data is held back to estimate performance on unseen examples.',
        'Preprocessing may include scaling, encoding, imputation, and transformations.',
        'Feature engineering creates or transforms variables so that useful signals are easier for a model to learn.',
    ]],
    ['Model Building', 'Model Building Notes', [
        'Select an algorithm based on the task, target type, data size, assumptions, interpretability needs, and available resources.',
        'Training adjusts model parameters to reduce error on the training data.',
        'Classification predicts categories, while regression predicts continuous numerical values.',
        'Compare candidate models using validation data or cross-validation rather than the final test set.',
        'Avoid overfitting: a model that memorizes training examples may perform poorly on new data.',
    ]],
    ['Model Evaluation', 'Model Evaluation Notes', [
        'Evaluation measures how well a trained model meets the chosen objective on data it did not train on.',
        'Keep the final test set isolated until the end of model selection and tuning.',
        'Accuracy can be misleading for imbalanced classes; consider precision, recall, F1 score, or a confusion matrix when appropriate.',
        'Regression commonly uses measures such as mean absolute error or mean squared error.',
        'Watch for data leakage, where information from validation or test data accidentally influences training.',
    ]],
];

const questions = [
    {
        section: 'Foundations Quiz',
        topic: 'Foundations',
        type: 'practice',
        duration: 20,
        passingMarks: 4,
        difficulty: 'easy',
        items: [
            ['What is machine learning primarily concerned with?', ['Writing every rule by hand', 'Learning patterns from data to make predictions or decisions', 'Replacing all computer hardware', 'Storing files permanently'], 1, 'Machine learning systems learn useful patterns from examples.'],
            ['Which part of a well-defined learning problem describes what the system should improve at?', ['Task', 'Performance measure', 'Experience', 'Hardware'], 1, 'The task identifies what the system must do; the performance measure describes improvement.'],
            ['What is a dataset?', ['A collection of data used for analysis or learning', 'A CPU instruction', 'A network cable', 'A password hash'], 0, 'Datasets contain the examples used to understand or train a model.'],
            ['Why are performance measures used?', ['To measure how well a model performs its task', 'To increase screen brightness', 'To delete training data', 'To choose a programming language'], 0, 'A performance measure provides an objective way to evaluate model behavior.'],
            ['What is a machine learning model?', ['A learned representation or function used to make predictions', 'A database backup', 'A monitor driver', 'A web browser'], 0, 'A model captures patterns learned from the training data.'],
        ],
    },
    {
        section: 'ML Pipeline and Data Preparation Quiz',
        topic: 'Data Preparation',
        type: 'practice',
        duration: 25,
        passingMarks: 5,
        difficulty: 'medium',
        items: [
            ['What is the first step in a typical machine learning pipeline?', ['Define the problem', 'Deploy immediately', 'Delete the dataset', 'Tune the final model'], 0, 'A clear problem definition guides data collection and evaluation.'],
            ['Why is data cleaning performed?', ['To address errors, missing values, and inconsistent data', 'To make a model always perfect', 'To remove the need for testing', 'To encrypt the CPU'], 0, 'Cleaning improves data quality before it is used for modeling.'],
            ['What is the purpose of a test set?', ['To estimate performance on unseen data', 'To train the model repeatedly', 'To store passwords', 'To replace feature engineering'], 0, 'The test set should represent data the model has not seen during training.'],
            ['What is feature engineering?', ['Creating or transforming input variables to make useful signals clearer', 'Deleting all input variables', 'Writing UI styles', 'Installing a database'], 0, 'Feature engineering transforms raw data into informative model inputs.'],
            ['Why should training and test data be kept separate?', ['To reduce misleading evaluation caused by seeing the answers', 'To increase duplicate records', 'To avoid defining a target', 'To remove all validation'], 0, 'Separation gives a more honest estimate of generalization.'],
        ],
    },
    {
        section: 'Machine Learning Final Assessment',
        topic: 'Complete Playlist',
        type: 'final',
        duration: 35,
        passingMarks: 6,
        difficulty: 'medium',
        items: [
            ['Which example is a classification task?', ['Predicting whether an email is spam', 'Predicting tomorrow’s temperature', 'Grouping customers without labels', 'Compressing a video'], 0, 'Classification predicts a category or class label.'],
            ['Which example is a regression task?', ['Predicting a house price', 'Choosing spam or not spam', 'Grouping unlabeled images', 'Sorting file names'], 0, 'Regression predicts a continuous numerical value.'],
            ['What does overfitting mean?', ['A model fits training data too closely and performs poorly on new data', 'A model has no parameters', 'A dataset has no rows', 'A model never trains'], 0, 'Overfit models memorize training-specific patterns instead of generalizing.'],
            ['What is the purpose of validation data?', ['To help compare or tune models before final testing', 'To replace all training data', 'To collect passwords', 'To guarantee zero error'], 0, 'Validation data supports model selection while the test set remains an unbiased final check.'],
            ['Which action helps prevent data leakage?', ['Fit preprocessing steps using training data only', 'Use test labels during training', 'Combine every split before evaluation', 'Evaluate on the training set only'], 0, 'Preprocessing must not use information from held-out data.'],
            ['What does model evaluation tell us?', ['How well the trained model meets the chosen performance objective', 'Which monitor to buy', 'How fast a network cable is', 'Whether a user is logged in'], 0, 'Evaluation connects model predictions to the selected metric and task.'],
        ],
    },
];

function toQuestion(assessmentId, item, order) {
    const [questionText, optionTexts, correctIndex, explanation] = item;
    return {
        assessment: assessmentId,
        type: 'mcq',
        questionText,
        options: optionTexts.map((text, index) => ({ text, isCorrect: index === correctIndex })),
        marks: 1,
        difficulty: 'medium',
        explanation,
        order,
    };
}

function writeNotesPdf(filePath, title, bullets) {
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({ margin: 54, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        stream.on('finish', resolve);
        stream.on('error', reject);
        document.pipe(stream);
        document.fontSize(22).fillColor('#312e81').text(title);
        document.moveDown(0.5);
        document.fontSize(10).fillColor('#4b5563').text('EduVance • Machine Learning Fundamentals');
        document.moveDown(1);
        bullets.forEach((bullet) => {
            document.fontSize(12).fillColor('#111827').text(`• ${bullet}`, {
                paragraphGap: 10,
                lineGap: 3,
            });
        });
        document.moveDown(1);
        document.fontSize(10).fillColor('#6b7280').text('Review these notes alongside the corresponding playlist videos.');
        document.end();
    });
}

async function seedMachineLearningCourse() {
    await mongoose.connect(process.env.MONGO_URI);
    const instructor = await User.findOne({ role: 'instructor', isActive: true });
    if (!instructor) throw new Error('Create an active instructor before seeding the ML course.');

    const course = await Course.findOneAndUpdate(
        { code: COURSE_CODE },
        {
            $set: {
                name: 'Machine Learning Fundamentals',
                description: 'Learn the foundations of machine learning, data preparation, model training, and evaluation.',
                fullDescription: 'A video-first introduction to machine learning based on the Neso Academy playlist. Students learn how to define learning problems, prepare datasets, build models, and evaluate results.',
                language: 'English',
                durationHours: 8,
                prerequisites: 'Basic programming and introductory mathematics.',
                learningOutcomes: [
                    'Explain core machine learning concepts and terminology.',
                    'Define a learning problem and prepare a dataset.',
                    'Apply train-test splitting and basic preprocessing.',
                    'Describe feature engineering, model training, and evaluation.',
                ],
                category: 'Machine Learning',
                playlistUrl: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`,
                instructor: instructor._id,
                topics: [...new Set(videos.map(([, , topic]) => topic))].map((title, index) => ({ title, order: index + 1 })),
                chapters: [...new Set(videos.map(([, , topic]) => topic))].map((title, index) => ({ title, order: index + 1 })),
                modules: [...new Set(videos.map(([, , topic]) => topic))].map((title, index) => ({
                    title,
                    order: index + 1,
                    lessons: videos.filter((video) => video[2] === title).map(([lessonTitle], lessonIndex) => ({ title: lessonTitle, order: lessonIndex + 1 })),
                })),
                difficulty: 'beginner',
                status: 'published',
                isActive: true,
                isDeleted: false,
            },
            $setOnInsert: { code: COURSE_CODE },
        },
        { upsert: true, new: true, runValidators: true },
    );

    await Lecture.deleteMany({ course: course._id });
    await Lecture.insertMany(videos.map(([title, videoId, topic], index) => ({
        title,
        course: course._id,
        topic,
        type: 'video',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}&list=${PLAYLIST_ID}&index=${index + 1}`,
        description: `Playlist lesson ${index + 1}: ${title}`,
        order: index + 1,
        uploadedBy: instructor._id,
        isActive: true,
    })));

    const notesDirectory = path.join(__dirname, '..', 'uploads', 'ml-notes');
    fs.mkdirSync(notesDirectory, { recursive: true });
    for (const [topic, title, bullets] of notes) {
        const fileName = `ml101-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
        const filePath = path.join(notesDirectory, fileName);
        await writeNotesPdf(filePath, title, bullets);
        await Lecture.create({
            title: `${topic} - PDF Notes`,
            course: course._id,
            topic,
            type: 'pdf',
            fileUrl: `/uploads/ml-notes/${fileName}`,
            fileName: `${title}.pdf`,
            description: `Revision notes for the ${topic} lessons.`,
            order: 100 + notes.findIndex(([noteTopic]) => noteTopic === topic),
            uploadedBy: instructor._id,
            isActive: true,
        });
    }

    const assessmentTitles = questions.map(({ section }) => section);
    await Assessment.deleteMany({ course: course._id, title: { $in: assessmentTitles } });
    for (const quiz of questions) {
        const assessment = await Assessment.create({
            title: quiz.section,
            course: course._id,
            topic: quiz.topic,
            type: quiz.type,
            assessmentType: 'quiz',
            description: `Check your understanding of the ${quiz.topic.toLowerCase()} lessons.`,
            instructions: 'Choose the best answer for each question. Review the related videos before attempting again.',
            totalMarks: quiz.items.length,
            passingMarks: quiz.passingMarks,
            duration: quiz.duration,
            difficulty: quiz.difficulty,
            maxAttempts: quiz.type === 'practice' ? 999 : 2,
            createdBy: instructor._id,
            isPublished: true,
            isActive: true,
        });
        await Question.insertMany(quiz.items.map((item, index) => toQuestion(assessment._id, item, index + 1)));
    }

    console.log(`Seeded ${course.name}: ${videos.length} lectures and ${questions.length} assessments.`);
}

if (require.main === module) {
    seedMachineLearningCourse()
        .catch((error) => {
            console.error('ML course seed failed:', error.message);
            process.exitCode = 1;
        })
        .finally(async () => {
            await mongoose.disconnect();
        });
}

module.exports = { seedMachineLearningCourse };
