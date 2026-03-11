require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const User = require('../models/User');

const seedQuiz = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the OS Course
        const osCourse = await Course.findOne({ code: 'CS301' });
        if (!osCourse) {
            console.error('❌ OS Course (CS301) not found.');
            process.exit(1);
        }

        // 2. Find a Teacher
        let teacher = await User.findOne({ email: 'teacher@demo.com' });
        if (!teacher) teacher = await User.findOne({ role: 'teacher' });
        if (!teacher) {
            console.error('❌ No teacher found.');
            process.exit(1);
        }

        // 3. Create/Update the Assessment
        console.log('📝 Creating/Updating OS Quiz Assessment (30 Questions)...');
        let assessment = await Assessment.findOne({
            title: 'Operating Systems - Video Companion Quiz',
            course: osCourse._id
        });

        if (assessment) {
            console.log('   Assessment exists. Clearing old questions...');
            await Question.deleteMany({ assessment: assessment._id });
        } else {
            assessment = await Assessment.create({
                title: 'Operating Systems - Video Companion Quiz',
                course: osCourse._id,
                topic: 'General Operating Systems',
                type: 'practice',
                description: 'A comprehensive 30-question quiz covering all major OS topics.',
                totalMarks: 30, // Will be updated
                passingMarks: 12,
                duration: 90,
                difficulty: 'medium',
                maxAttempts: 999,
                createdBy: teacher._id,
                isPublished: true
            });
            console.log('   Created new Assessment.');
        }

        // 4. Define 30 Questions
        const questionsList = [
            // --- Introduction ---
            {
                q: "What is the primary goal of an Operating System?",
                options: [
                    { text: "To execute user programs and make solving user problems easier", isCorrect: true },
                    { text: "To increase the cost of computer hardware", isCorrect: false },
                    { text: "To prevent users from using the computer", isCorrect: false },
                    { text: "To allow direct hardware access only", isCorrect: false }
                ],
                explanation: "The OS acts as an intermediary to manage resources and execute programs efficiently."
            },
            {
                q: "Which of the following is considered volatile storage?",
                options: [
                    { text: "Main Memory (RAM)", isCorrect: true },
                    { text: "Hard Disk Drive", isCorrect: false },
                    { text: "Solid State Drive", isCorrect: false },
                    { text: "Optical Disk", isCorrect: false }
                ],
                explanation: "Volatile storage loses its contents when power is turned off, unlike non-volatile storage."
            },
            {
                q: "What is the mode bit used for?",
                options: [
                    { text: "To distinguish between user mode and kernel mode", isCorrect: true },
                    { text: "To switch between processes", isCorrect: false },
                    { text: "To encrypt data", isCorrect: false },
                    { text: "To manage file permissions", isCorrect: false }
                ],
                explanation: "The mode bit (0 for kernel, 1 for user) protects the OS from user errors."
            },
            {
                q: "Which system call is used to create a new process in Unix/Linux?",
                options: [
                    { text: "fork()", isCorrect: true },
                    { text: "create()", isCorrect: false },
                    { text: "new()", isCorrect: false },
                    { text: "process()", isCorrect: false }
                ],
                explanation: "fork() creates a new process by duplicating the calling process."
            },
            {
                q: "What is the advantage of a Microkernel architecture?",
                options: [
                    { text: "Easier to extend the operating system", isCorrect: true },
                    { text: "Faster performance than monolithic", isCorrect: false },
                    { text: "Less overhead in communication", isCorrect: false },
                    { text: "It includes all services in kernel space", isCorrect: false }
                ],
                explanation: "Microkernels move many services to user space, making it easier to add new services without modifying the kernel."
            },
            {
                q: "What is the main benefit of Virtual Machines?",
                options: [
                    { text: "Complete protection of system resources", isCorrect: true },
                    { text: "Direct hardware access for all apps", isCorrect: false },
                    { text: "Faster boot times", isCorrect: false },
                    { text: "Zero overhead", isCorrect: false }
                ],
                explanation: "VMs isolate execution environments, protecting the host and other VMs."
            },

            // --- Process Management ---
            {
                q: "Which of the following is NOT contained in the Process Control Block (PCB)?",
                options: [
                    { text: "Bootstrap program", isCorrect: true },
                    { text: "Program Counter", isCorrect: false },
                    { text: "CPU registers", isCorrect: false },
                    { text: "Process state", isCorrect: false }
                ],
                explanation: "The bootstrap program is in ROM/EEPROM, not in a process's PCB."
            },
            {
                q: "When a process is waiting for an I/O event, it moves to which state?",
                options: [
                    { text: "Waiting", isCorrect: true },
                    { text: "Ready", isCorrect: false },
                    { text: "Running", isCorrect: false },
                    { text: "Terminated", isCorrect: false }
                ],
                explanation: "A process moves from Running to Waiting when it needs to wait for an event like I/O."
            },
            {
                q: "What is a Context Switch?",
                options: [
                    { text: "Saving the state of one process and loading the state of another", isCorrect: true },
                    { text: "Switching between user mode and kernel mode", isCorrect: false },
                    { text: "Moving a process to disk", isCorrect: false },
                    { text: "Starting a new thread", isCorrect: false }
                ],
                explanation: "Context switching allows multiple processes to share a single CPU."
            },
            {
                q: "Which system call allows a parent process to wait for the termination of a child process?",
                options: [
                    { text: "wait()", isCorrect: true },
                    { text: "sleep()", isCorrect: false },
                    { text: "stop()", isCorrect: false },
                    { text: "exit()", isCorrect: false }
                ],
                explanation: "wait() suspends execution of the calling process until one of its children terminates."
            },
            {
                q: "What is the 'Degree of Multiprogramming'?",
                options: [
                    { text: "The number of processes in memory", isCorrect: true },
                    { text: "The number of CPUs", isCorrect: false },
                    { text: "The size of main memory", isCorrect: false },
                    { text: "The number of I/O devices", isCorrect: false }
                ],
                explanation: "The long-term scheduler controls the degree of multiprogramming."
            },

            // --- Threads & IPC ---
            {
                q: "In Message Passing systems, how do processes communicate?",
                options: [
                    { text: "By exchanging messages via a kernel channel", isCorrect: true },
                    { text: "By reading/writing to a shared variable", isCorrect: false },
                    { text: "By accessing the same physical memory", isCorrect: false },
                    { text: "By using global variables", isCorrect: false }
                ],
                explanation: "Message passing involves sending and receiving messages, useful in distributed environments."
            },
            {
                q: "What identifies a process on a network in socket communication?",
                options: [
                    { text: "IP address and Port number", isCorrect: true },
                    { text: "MAC address only", isCorrect: false },
                    { text: "Process ID (PID) only", isCorrect: false },
                    { text: "Host name", isCorrect: false }
                ],
                explanation: "The IP address identifies the host using the process, and the port number identifies the specific process."
            },
            {
                q: "Which of the following is true for User-level threads?",
                options: [
                    { text: "They are managed by a thread library in user space", isCorrect: true },
                    { text: "The kernel is aware of them", isCorrect: false },
                    { text: "They are slower to create than kernel threads", isCorrect: false },
                    { text: "They support true parallelism on multicore without kernel support", isCorrect: false }
                ],
                explanation: "User threads are managed without kernel support, making them fast but blocking system calls can block the entire process."
            },

            // --- CPU Scheduling ---
            {
                q: "Which scheduling algorithm suffers from the Convoy Effect?",
                options: [
                    { text: "First-Come, First-Served (FCFS)", isCorrect: true },
                    { text: "Round Robin (RR)", isCorrect: false },
                    { text: "Shortest Job First (SJF)", isCorrect: false },
                    { text: "Priority Scheduling", isCorrect: false }
                ],
                explanation: "In FCFS, short processes can get stuck waiting behind a long CPU-bound process."
            },
            {
                q: "Which component of the OS gives control of the CPU to the process selected by the short-term scheduler?",
                options: [
                    { text: "Dispatcher", isCorrect: true },
                    { text: "Scheduler", isCorrect: false },
                    { text: "Interrupt handler", isCorrect: false },
                    { text: "Monitor", isCorrect: false }
                ],
                explanation: "The dispatcher performs the context switch and jumps to the proper location in the program."
            },
            {
                q: "What is the solution to 'Starvation' in Priority Scheduling?",
                options: [
                    { text: "Aging", isCorrect: true },
                    { text: "Context Switching", isCorrect: false },
                    { text: "Swapping", isCorrect: false },
                    { text: "Mutex Locks", isCorrect: false }
                ],
                explanation: "Aging involves gradually increasing the priority of processes that wait in the system for a long time."
            },
            {
                q: "The performance of Round Robin scheduling depends heavily on:",
                options: [
                    { text: "The size of the time quantum", isCorrect: true },
                    { text: "The number of I/O devices", isCorrect: false },
                    { text: "The size of memory", isCorrect: false },
                    { text: "The disk speed", isCorrect: false }
                ],
                explanation: "If the quantum is too large, it behaves like FCFS; if too small, overhead increases."
            },

            // --- Synchronization ---
            {
                q: "What is the 'Critical Section'?",
                options: [
                    { text: "A segment of code where shared resources are accessed", isCorrect: true },
                    { text: "The boot sequence of the OS", isCorrect: false },
                    { text: "A high-priority interrupt", isCorrect: false },
                    { text: "A reserved memory for the kernel", isCorrect: false }
                ],
                explanation: "Only one process should be executing in its critical section at a time."
            },
            {
                q: "Peterson's solution is a valid solution for:",
                options: [
                    { text: "Two processes", isCorrect: true },
                    { text: "Infinite processes", isCorrect: false },
                    { text: "Only hardware interrupts", isCorrect: false },
                    { text: "Network synchronization", isCorrect: false }
                ],
                explanation: "Peterson's solution provides a good algorithmic description of solving the critical-section problem for two processes."
            },
            {
                q: "What happens if a process executes wait() on a semaphore with a value of 0?",
                options: [
                    { text: "It blocks until the value becomes positive", isCorrect: true },
                    { text: "It continues execution", isCorrect: false },
                    { text: "It terminates", isCorrect: false },
                    { text: "It restarts", isCorrect: false }
                ],
                explanation: "Wait() decrements the value; if it's 0 (or negative in some implementations), the process blocks."
            },
            {
                q: "In the Readers-Writers problem, what is the main constraint?",
                options: [
                    { text: "Multiple readers can read, but only one writer can write", isCorrect: true },
                    { text: "Only one reader can read at a time", isCorrect: false },
                    { text: "Writers can write simultaneously", isCorrect: false },
                    { text: "Readers must wait for writers to finish reading", isCorrect: false }
                ],
                explanation: "Simultaneous reading is allowed, but writing requires exclusive access."
            },
            {
                q: "What is a Monitor in synchronization?",
                options: [
                    { text: "A high-level synchronization construct", isCorrect: true },
                    { text: "A hardware screen", isCorrect: false },
                    { text: "A type of CPU register", isCorrect: false },
                    { text: "A low-level assembly instruction", isCorrect: false }
                ],
                explanation: "Monitors provide a convenient and effective mechanism for process synchronization using condition variables."
            },

            // --- Deadlocks ---
            {
                q: "Which of the following is NOT a necessary condition for Deadlock?",
                options: [
                    { text: "Starvation", isCorrect: true },
                    { text: "Mutual Exclusion", isCorrect: false },
                    { text: "Hold and Wait", isCorrect: false },
                    { text: "Circular Wait", isCorrect: false }
                ],
                explanation: "Starvation is a possible effect of poor scheduling but not a deadlock condition."
            },
            {
                q: "The Banker's Algorithm is used for:",
                options: [
                    { text: "Deadlock Avoidance", isCorrect: true },
                    { text: "Deadlock Prevention", isCorrect: false },
                    { text: "Deadlock Detection", isCorrect: false },
                    { text: "Deadlock Recovery", isCorrect: false }
                ],
                explanation: "It checks if allocating resources would leave the system in a safe state."
            },

            // --- Memory Management ---
            {
                q: "What is the purpose of Paging?",
                options: [
                    { text: "To permit the physical address space of a process to be noncontiguous", isCorrect: true },
                    { text: "To increase disk speed", isCorrect: false },
                    { text: "To manage CPU scheduling", isCorrect: false },
                    { text: "To synchronize threads", isCorrect: false }
                ],
                explanation: "Paging avoids external fragmentation and the need for compaction."
            },
            {
                q: "Thrashing occurs when:",
                options: [
                    { text: "A process spends more time paging than executing", isCorrect: true },
                    { text: "The CPU is idle", isCorrect: false },
                    { text: "The disk is full", isCorrect: false },
                    { text: "There are too many threads", isCorrect: false }
                ],
                explanation: "Thrashing degrades performance significantly as the system struggles to keep necessary pages in memory."
            },
            {
                q: "What is Fragmentation?",
                options: [
                    { text: "Wasted memory space", isCorrect: true },
                    { text: "Broken hardware", isCorrect: false },
                    { text: "Network packet loss", isCorrect: false },
                    { text: "Corrupted files", isCorrect: false }
                ],
                explanation: "Internal and external fragmentation refer to unusable memory blocks."
            },

            // --- File Systems ---
            {
                q: "What is the File Control Block (FCB)?",
                options: [
                    { text: "A structure containing information about a specific file", isCorrect: true },
                    { text: "A block of data in the file", isCorrect: false },
                    { text: "The master boot record", isCorrect: false },
                    { text: "A directory entry", isCorrect: false }
                ],
                explanation: "FCB (or inode in Unix) stores file attributes like ownership, permissions, and location."
            },
            {
                q: "Which disk scheduling algorithm services requests based on the shortest seek time?",
                options: [
                    { text: "SSTF (Shortest Seek Time First)", isCorrect: true },
                    { text: "FCFS", isCorrect: false },
                    { text: "SCAN", isCorrect: false },
                    { text: "C-SCAN", isCorrect: false }
                ],
                explanation: "SSTF selects the request with the minimum seek time from the current head position."
            }
        ];

        console.log(`Prepared ${questionsList.length} questions.`);

        const questionsToInsert = questionsList.map((q, index) => ({
            assessment: assessment._id,
            type: 'mcq',
            questionText: q.q,
            options: q.options,
            marks: 1, // REQUIREMENT: 1 Mark each
            difficulty: 'medium',
            explanation: q.explanation,
            order: index + 1
        }));

        await Question.insertMany(questionsToInsert);

        // Update Assessment totals
        const totalMarks = questionsToInsert.length * 1;
        const passingMarks = Math.ceil(totalMarks * 0.4);

        await Assessment.findByIdAndUpdate(assessment._id, {
            totalMarks: totalMarks,
            passingMarks: passingMarks,
            description: `A comprehensive ${questionsToInsert.length}-question quiz covering all major OS topics.`
        });

        console.log('✅ Quiz generation complete!');
        console.log(`   Assessment: "${assessment.title}"`);
        console.log(`   Total Questions: ${questionsToInsert.length}`);
        console.log(`   Total Marks: ${totalMarks}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error generating quiz:', error);
        process.exit(1);
    }
};

seedQuiz();
