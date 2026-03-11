const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');

const subjects = [
    {
        code: 'AI101',
        name: 'Artificial Intelligence',
        questions: [
            {
                questionText: 'What is the characteristic of an "admissible" heuristic in the A* algorithm?',
                options: [
                    { text: 'It always overestimates the actual cost to the goal.', isCorrect: false },
                    { text: 'It never overestimates the actual cost to the goal.', isCorrect: true },
                    { text: 'It is always equal to the actual cost.', isCorrect: false },
                    { text: 'It only considers the distance from the start node.', isCorrect: false }
                ],
                explanation: 'A heuristic is admissible if it never overestimates the cost to reach the goal. This property ensures that A* will find an optimal path.'
            },
            {
                questionText: 'In Alpha-Beta pruning, what does the "Beta" value represent?',
                options: [
                    { text: 'The maximum score that the maximizing player is assured of.', isCorrect: false },
                    { text: 'The minimum score that the minimizing player is assured of.', isCorrect: true },
                    { text: 'The current score of the minimax algorithm.', isCorrect: false },
                    { text: 'The total number of nodes pruned in the tree.', isCorrect: false }
                ],
                explanation: 'Beta represents the best (lowest-value) choice found so far for the minimizer. If a value is found higher than Beta, the maximizer will not choose it, allowing for pruning.'
            },
            {
                questionText: 'Which type of agent uses a mapping from percept histories to actions to make decisions?',
                options: [
                    { text: 'Simple Reflex Agent', isCorrect: false },
                    { text: 'Model-based Reflex Agent', isCorrect: false },
                    { text: 'Goal-based Agent', isCorrect: false },
                    { text: 'Intelligent Agent (Generic description)', isCorrect: true }
                ],
                explanation: 'While reflex agents only use current percepts, an intelligent agent can maintain history. A Model-based agent specificially uses history to maintain state.'
            },
            {
                questionText: 'What is the primary difference between BFS and DFS in terms of space complexity?',
                options: [
                    { text: 'BFS is always O(1) space.', isCorrect: false },
                    { text: 'DFS usually requires less memory as it only stores the current path.', isCorrect: true },
                    { text: 'BFS requires O(log n) memory.', isCorrect: false },
                    { text: 'DFS is always O(b^d) memory.', isCorrect: false }
                ],
                explanation: 'DFS stores nodes on the current path (O(bm)), while BFS must store all nodes at the current level (O(b^d)), which is significantly larger for wide trees.'
            },
            {
                questionText: 'In Propositional Logic, what does the symbol "⇒" usually represent?',
                options: [
                    { text: 'Negation', isCorrect: false },
                    { text: 'Conjunction', isCorrect: false },
                    { text: 'Disjunction', isCorrect: false },
                    { text: 'Implication', isCorrect: true }
                ],
                explanation: 'The arrow "⇒" represents "If P then Q" or material implication.'
            },
            {
                questionText: 'Which search algorithm uses a heuristic to expand the node that is closest to the goal?',
                options: [
                    { text: 'Breadth-First Search', isCorrect: false },
                    { text: 'Best-First Search', isCorrect: true },
                    { text: 'Iterative Deepening', isCorrect: false },
                    { text: 'Uniform Cost Search', isCorrect: false }
                ],
                explanation: 'Greedy Best-First Search uses only the heuristic value to decide which node to expand next.'
            },
            {
                questionText: 'What is "Stochastic Hill Climbing"?',
                options: [
                    { text: 'Choosing the best neighbor always.', isCorrect: false },
                    { text: 'Choosing a random neighbor from among the better ones.', isCorrect: true },
                    { text: 'Choosing any random neighbor regardless of value.', isCorrect: false },
                    { text: 'Starting from a random point every time.', isCorrect: false }
                ],
                explanation: 'Stochastic hill climbing chooses at random from among the uphill moves; the probability of selection can vary with the steepness of the uphill move.'
            },
            {
                questionText: 'Which of the following is NOT a component of a Constraint Satisfaction Problem (CSP)?',
                options: [
                    { text: 'Variables', isCorrect: false },
                    { text: 'Domains', isCorrect: false },
                    { text: 'Heuristic Functions', isCorrect: true },
                    { text: 'Constraints', isCorrect: false }
                ],
                explanation: 'A CSP is defined by a set of variables, their domains, and constraints that specify allowed combinations of values. While heuristics help solve it, they are not part of the definition.'
            },
            {
                questionText: 'What does "NLP" stand for in Artificial Intelligence?',
                options: [
                    { text: 'Non-Linear Programming', isCorrect: false },
                    { text: 'Natural Language Processing', isCorrect: true },
                    { text: 'Network Layer Protocol', isCorrect: false },
                    { text: 'Neural Logical Processing', isCorrect: false }
                ],
                explanation: 'NLP focuses on the interaction between computers and human languages.'
            },
            {
                questionText: 'In Neural Networks, what is the role of an "Activation Function"?',
                options: [
                    { text: 'To store the weights of the network.', isCorrect: false },
                    { text: 'To introduce non-linearity into the output of a neuron.', isCorrect: true },
                    { text: 'To calculate the error during backpropagation.', isCorrect: false },
                    { text: 'To normalize the input data.', isCorrect: false }
                ],
                explanation: 'Activation functions like ReLU or Sigmoid allow neural networks to learn complex, non-linear relationships in data.'
            },
            {
                questionText: 'Which learning paradigm involves an agent receiving rewards for its actions?',
                options: [
                    { text: 'Supervised Learning', isCorrect: false },
                    { text: 'Unsupervised Learning', isCorrect: false },
                    { text: 'Reinforcement Learning', isCorrect: true },
                    { text: 'Deep Learning', isCorrect: false }
                ],
                explanation: 'Reinforcement Learning focuses on learning by trial and error based on feedback (rewards or penalties).'
            },
            {
                questionText: 'What is a "Turing Test" designed to measure?',
                options: [
                    { text: 'The processing speed of a computer.', isCorrect: false },
                    { text: 'A machine\'s ability to exhibit intelligent behavior equivalent to a human.', isCorrect: true },
                    { text: 'The storage capacity of an AI system.', isCorrect: false },
                    { text: 'The efficiency of a search algorithm.', isCorrect: false }
                ],
                explanation: 'The Turing Test assesses if a machine can deceive a human into thinking it is also human through conversational responses.'
            },
            {
                questionText: 'Which search algorithm is optimal and complete if the heuristic is consistent?',
                options: [
                    { text: 'DFS', isCorrect: false },
                    { text: 'A*', isCorrect: true },
                    { text: 'Greedy Best-First', isCorrect: false },
                    { text: 'Hill Climbing', isCorrect: false }
                ],
                explanation: 'A* search using a consistent (monotone) heuristic is both complete and optimal.'
            },
            {
                questionText: 'What is the purpose of "Backtracking" in solving CSPs?',
                options: [
                    { text: 'To restart the search from the beginning.', isCorrect: false },
                    { text: 'To go back to the previous variable assignment when a constraint is violated.', isCorrect: true },
                    { text: 'To check all possible combinations in parallel.', isCorrect: false },
                    { text: 'To prune the search tree using heuristics.', isCorrect: false }
                ],
                explanation: 'Backtracking search is a depth-first search that chooses values for one variable at a time and moves back when no legal values are left.'
            },
            {
                questionText: 'In Fuzzy Logic, a value of 0.7 represents:',
                options: [
                    { text: 'False', isCorrect: false },
                    { text: 'True', isCorrect: false },
                    { text: 'Partial membership in a set', isCorrect: true },
                    { text: 'A probability of occurrence', isCorrect: false }
                ],
                explanation: 'Fuzzy logic allows for degrees of truth between 0 and 1, representing partial membership in a set.'
            },
            {
                questionText: 'What is the "Membership Function" in Fuzzy Logic used for?',
                options: [
                    { text: 'Joining two fuzzy sets.', isCorrect: false },
                    { text: 'Determining the degree of truth for an input.', isCorrect: true },
                    { text: 'Pruning a decision tree.', isCorrect: false },
                    { text: 'Calculating the entropy of data.', isCorrect: false }
                ],
                explanation: 'The membership function maps each point in the input space to a membership value between 0 and 1.'
            },
            {
                questionText: 'What is "Semantic Net"?',
                options: [
                    { text: 'A neural network architecture.', isCorrect: false },
                    { text: 'A graphic notation for representing knowledge in patterns of interconnected nodes and arcs.', isCorrect: true },
                    { text: 'A protocol for web indexing.', isCorrect: false },
                    { text: 'A method for compressing text data.', isCorrect: false }
                ],
                explanation: 'Semantic networks represent knowledge through nodes (objects/concepts) and links (relationships).'
            },
            {
                questionText: 'Which algorithm is used for optimizing weights in a Neural Network?',
                options: [
                    { text: 'A* Search', isCorrect: false },
                    { text: 'Backpropagation', isCorrect: true },
                    { text: 'Minimax', isCorrect: false },
                    { text: 'Alpha-Beta Pruning', isCorrect: false }
                ],
                explanation: 'Backpropagation computes the gradient of the loss function with respect to the weights by the chain rule.'
            },
            {
                questionText: 'What is "Overfitting" in Machine Learning?',
                options: [
                    { text: 'When the model is too simple to learn the data.', isCorrect: false },
                    { text: 'When the model learns the training data and noise too well, failing on new data.', isCorrect: true },
                    { text: 'When the model takes too long to train.', isCorrect: false },
                    { text: 'When the data is not sufficient for training.', isCorrect: false }
                ],
                explanation: 'Overfitting occurs when a model captures random fluctuations in the training data rather than the underlying pattern.'
            },
            {
                questionText: 'In First-Order Logic, what does the quantifier "∃" represent?',
                options: [
                    { text: 'For all', isCorrect: false },
                    { text: 'There exists', isCorrect: true },
                    { text: 'Not equal to', isCorrect: false },
                    { text: 'Contradiction', isCorrect: false }
                ],
                explanation: 'The existential quantifier "∃" means "there is at least one" or "for some".'
            },
            {
                questionText: 'Which search strategy expands the shallowest unexpanded node first?',
                options: [
                    { text: 'DFS', isCorrect: false },
                    { text: 'BFS', isCorrect: true },
                    { text: 'Uniform Cost', isCorrect: false },
                    { text: 'Depth Limited', isCorrect: false }
                ],
                explanation: 'Breadth-First Search uses a FIFO queue to always expand nodes at the current depth before moving deeper.'
            },
            {
                questionText: 'What is the "Environment" of an AI agent?',
                options: [
                    { text: 'The hardware the agent runs on.', isCorrect: false },
                    { text: 'The surrounding world where the agent operates and perceives.', isCorrect: true },
                    { text: 'The programming language used.', isCorrect: false },
                    { text: 'The user who provides input.', isCorrect: false }
                ],
                explanation: 'The environment is everything external to the agent that it can interact with via sensors and actuators.'
            },
            {
                questionText: 'What define a "Global Variable" in Artificial Intelligence logic?',
                options: [
                    { text: 'A variable accessible only within a function.', isCorrect: false },
                    { text: 'A variable with a scope that encompasses the entire program.', isCorrect: true },
                    { text: 'A variable that never changes value.', isCorrect: false },
                    { text: 'A variable used in search trees only.', isCorrect: false }
                ],
                explanation: 'Global variables are accessible throughout the execution of the entire program/system.'
            },
            {
                questionText: 'What is "Resolution" in logic-based AI?',
                options: [
                    { text: 'The clarity of a generated image.', isCorrect: false },
                    { text: 'An inference rule that yields a complete proof system when coupled with a search algorithm.', isCorrect: true },
                    { text: 'The speed of a processor.', isCorrect: false },
                    { text: 'The number of bits in a word.', isCorrect: false }
                ],
                explanation: 'Resolution is a rule of inference used to prove theorems by contradiction in propositional and first-order logic.'
            },
            {
                questionText: 'Which neural network layer is responsible for feature extraction in images?',
                options: [
                    { text: 'Fully Connected Layer', isCorrect: false },
                    { text: 'Convolutional Layer', isCorrect: true },
                    { text: 'Output Layer', isCorrect: false },
                    { text: 'Softmax Layer', isCorrect: false }
                ],
                explanation: 'Convolutional layers apply filters to input images to detect patterns like edges, textures, and shapes.'
            },
            {
                questionText: 'What is a "Markov Decision Process" (MDP) used for?',
                options: [
                    { text: 'Sorting large datasets.', isCorrect: false },
                    { text: 'Modeling decision making in situations where outcomes are partly random.', isCorrect: true },
                    { text: 'Compiling Python code.', isCorrect: false },
                    { text: 'Managing memory in a database.', isCorrect: false }
                ],
                explanation: 'MDPs provide a mathematical framework for modeling sequential decision making under uncertainty.'
            },
            {
                questionText: 'What is the "Exploration vs Exploitation" trade-off?',
                options: [
                    { text: 'Choosing between different programming languages.', isCorrect: false },
                    { text: 'Choosing between searching for new info and using known optimal info.', isCorrect: true },
                    { text: 'Choosing between CPU and GPU processing.', isCorrect: false },
                    { text: 'Choosing between supervised and unsupervised learning.', isCorrect: false }
                ],
                explanation: 'In RL, an agent must balance trying new actions to find better rewards (exploration) and using actions known to give high rewards (exploitation).'
            },
            {
                questionText: 'What is a "Uniform Cost Search"?',
                options: [
                    { text: 'A search where all edges have a cost of 1.', isCorrect: false },
                    { text: 'A search that expands nodes in order of their cumulative path cost.', isCorrect: true },
                    { text: 'A search that has a fixed time limit.', isCorrect: false },
                    { text: 'A search that uses a depth limit.', isCorrect: false }
                ],
                explanation: 'Uniform Cost Search (Dijkstra\'s) finds the cheapest path by always expanding the node with the lowest path cost from the start.'
            },
            {
                questionText: 'What is the function of "Sensors" in an AI agent?',
                options: [
                    { text: 'To perform actions in the world.', isCorrect: false },
                    { text: 'To perceive information from the environment.', isCorrect: true },
                    { text: 'To store the weights of the network.', isCorrect: false },
                    { text: 'To calculate the gradient of loss.', isCorrect: false }
                ],
                explanation: 'Sensors allow the agent to receive data from its environment (e.g., cameras, microphones, touch sensors).'
            },
            {
                questionText: 'What is a "Frame" in knowledge representation?',
                options: [
                    { text: 'A single image in a video.', isCorrect: false },
                    { text: 'A data structure used to represent stereotypical situations or objects.', isCorrect: true },
                    { text: 'The border of a UI component.', isCorrect: false },
                    { text: 'A packet in network communication.', isCorrect: false }
                ],
                explanation: 'Frames organize knowledge into "slots" and "fillers" to describe complex objects and their attributes.'
            }
        ]
    },
    {
        code: 'CS307',
        name: 'C Programming',
        questions: [
            {
                questionText: 'Which storage class in C specifies that a variable is stored in the CPU registers?',
                options: [
                    { text: 'auto', isCorrect: false },
                    { text: 'static', isCorrect: false },
                    { text: 'extern', isCorrect: false },
                    { text: 'register', isCorrect: true }
                ],
                explanation: 'The "register" keyword requests the compiler to store the variable in a CPU register for faster access.'
            },
            {
                questionText: 'What is the output of printf("%d", 10 + 010 + 0x10);?',
                options: [
                    { text: '30', isCorrect: false },
                    { text: '34', isCorrect: true },
                    { text: '42', isCorrect: false },
                    { text: '38', isCorrect: false }
                ],
                explanation: '10 is decimal, 010 is octal (8), and 0x10 is hexadecimal (16). Sum: 10 + 8 + 16 = 34.'
            },
            {
                questionText: 'Which operator has the highest precedence in C?',
                options: [
                    { text: 'Comma (,)', isCorrect: false },
                    { text: 'Assignment (=)', isCorrect: false },
                    { text: 'Post-increment (++)', isCorrect: true },
                    { text: 'Logical AND (&&)', isCorrect: false }
                ],
                explanation: 'Postfix operators like ++ and () have the highest precedence among those listed.'
            },
            {
                questionText: 'What is a "Dangling Pointer" in C?',
                options: [
                    { text: 'A pointer that points to NULL.', isCorrect: false },
                    { text: 'A pointer that points to a memory location that has been freed.', isCorrect: true },
                    { text: 'A pointer that has not been initialized.', isCorrect: false },
                    { text: 'A pointer that points to the wrong data type.', isCorrect: false }
                ],
                explanation: 'A dangling pointer arises when the object it points to is deleted or deallocated, without modifying the value of the pointer.'
            },
            {
                questionText: 'What is the size of a "long double" data type in most 64-bit C compilers?',
                options: [
                    { text: '4 bytes', isCorrect: false },
                    { text: '8 bytes', isCorrect: false },
                    { text: '12 or 16 bytes', isCorrect: true },
                    { text: '2 bytes', isCorrect: false }
                ],
                explanation: 'long double is designed for higher precision than double and typically occupies 12 or 16 bytes depending on the implementation.'
            },
            {
                questionText: 'Which function is used to release dynamically allocated memory in C?',
                options: [
                    { text: 'malloc()', isCorrect: false },
                    { text: 'free()', isCorrect: true },
                    { text: 'calloc()', isCorrect: false },
                    { text: 'realloc()', isCorrect: false }
                ],
                explanation: 'free() deallocates memory previously allocated by malloc, calloc, or realloc.'
            },
            {
                questionText: 'What is the purpose of the "extern" keyword?',
                options: [
                    { text: 'To declare a variable with internal linkage.', isCorrect: false },
                    { text: 'To declare a variable that is defined in another file or scope.', isCorrect: true },
                    { text: 'To make a variable constant.', isCorrect: false },
                    { text: 'To allocate memory in the heap.', isCorrect: false }
                ],
                explanation: 'extern is used to extend the visibility of a variable or function across multiple files.'
            },
            {
                questionText: 'Which of the following is NOT a valid variable name in C?',
                options: [
                    { text: '_count', isCorrect: false },
                    { text: 'total_sum', isCorrect: false },
                    { text: '2nd_value', isCorrect: true },
                    { text: 'value2', isCorrect: false }
                ],
                explanation: 'Variable names in C cannot start with a digit.'
            },
            {
                questionText: 'What does the "static" modifier do to a local variable?',
                options: [
                    { text: 'Makes it accessible globally.', isCorrect: false },
                    { text: 'Preserves its value between function calls.', isCorrect: true },
                    { text: 'Stores it in the CPU register.', isCorrect: false },
                    { text: 'Makes it read-only.', isCorrect: false }
                ],
                explanation: 'Static local variables are initialized once and retain their value until the program ends.'
            },
            {
                questionText: 'How are strings represented in C?',
                options: [
                    { text: 'As a native String data type.', isCorrect: false },
                    { text: 'As an array of characters terminated by a null character (\'\\0\').', isCorrect: true },
                    { text: 'As an object of the String class.', isCorrect: false },
                    { text: 'As a linked list of characters.', isCorrect: false }
                ],
                explanation: 'In C, strings are simply character arrays where the end is marked by the null terminator.'
            },
            {
                questionText: 'What is "Structure Padding" in C?',
                options: [
                    { text: 'Adding extra members to a structure.', isCorrect: false },
                    { text: 'Adding empty bytes between members to align them in memory.', isCorrect: true },
                    { text: 'Wrapping a structure inside another.', isCorrect: false },
                    { text: 'Filling the structure with null values.', isCorrect: false }
                ],
                explanation: 'Padding ensures that structure members are placed at addresses that are multiples of their size, improving CPU performance.'
            },
            {
                questionText: 'What is the difference between a "Structure" and a "Union"?',
                options: [
                    { text: 'Structures are larger than Unions.', isCorrect: false },
                    { text: 'Unions allocate enough memory for the largest member, which is shared by all members.', isCorrect: true },
                    { text: 'Unions can only store integers.', isCorrect: false },
                    { text: 'Structures cannot have pointers.', isCorrect: false }
                ],
                explanation: 'In a Union, all members share the same memory location, while in a Structure, each member has its own.'
            },
            {
                questionText: 'What is the correct syntax to access a member "val" via a pointer "p" to a structure?',
                options: [
                    { text: 'p.val', isCorrect: false },
                    { text: 'p->val', isCorrect: true },
                    { text: '(*p)->val', isCorrect: false },
                    { text: 'p&val', isCorrect: false }
                ],
                explanation: 'The arrow operator "->" is shorthand for (*p).val when dealing with pointers to structures.'
            },
            {
                questionText: 'In C, what is the value of an uninitialized "static" global variable?',
                options: [
                    { text: 'Garbage value', isCorrect: false },
                    { text: '0', isCorrect: true },
                    { text: 'NULL', isCorrect: false },
                    { text: '-1', isCorrect: false }
                ],
                explanation: 'Static and global variables are automatically initialized to zero by the compiler.'
            },
            {
                questionText: 'Which function is used to find the length of a string in C?',
                options: [
                    { text: 'length()', isCorrect: false },
                    { text: 'strlen()', isCorrect: true },
                    { text: 'strcount()', isCorrect: false },
                    { text: 'sizeof()', isCorrect: false }
                ],
                explanation: 'strlen() counts the number of characters in a string excluding the null terminator.'
            },
            {
                questionText: 'What is the role of the "default" case in a switch statement?',
                options: [
                    { text: 'It must be the first case.', isCorrect: false },
                    { text: 'It executes if no other case matches.', isCorrect: true },
                    { text: 'It is required for common switch usage.', isCorrect: false },
                    { text: 'It terminates the program.', isCorrect: false }
                ],
                explanation: 'The default case identifies code to run when the expression doesn\'t match any specific case values.'
            },
            {
                questionText: 'What does "Call by Reference" mean in C?',
                options: [
                    { text: 'Passing the value of a variable to a function.', isCorrect: false },
                    { text: 'Passing the address of a variable to a function.', isCorrect: true },
                    { text: 'Calling a function using its name.', isCorrect: false },
                    { text: 'Passing a copy of a variable.', isCorrect: false }
                ],
                explanation: 'Passing an address allows the function to modify the actual variable in the caller\'s scope.'
            },
            {
                questionText: 'What is the purpose of "typedef" in C?',
                options: [
                    { text: 'To create new data types.', isCorrect: false },
                    { text: 'To create an alias for an existing data type.', isCorrect: true },
                    { text: 'To define a constant.', isCorrect: false },
                    { text: 'To allocate memory.', isCorrect: false }
                ],
                explanation: 'typedef is used to give a new name to a type, often used for complex structure declarations.'
            },
            {
                questionText: 'Which loop is guaranteed to execute at least once?',
                options: [
                    { text: 'for', isCorrect: false },
                    { text: 'while', isCorrect: false },
                    { text: 'do-while', isCorrect: true },
                    { text: 'none of these', isCorrect: false }
                ],
                explanation: 'do-while checks its condition at the end of the loop body.'
            },
            {
                questionText: 'What is the "Bitwise OR" operator in C?',
                options: [
                    { text: '||', isCorrect: false },
                    { text: '|', isCorrect: true },
                    { text: '^', isCorrect: false },
                    { text: '!', isCorrect: false }
                ],
                explanation: '| is the bitwise OR, while || is the logical OR.'
            },
            {
                questionText: 'What is the result of 5 / 2 in C?',
                options: [
                    { text: '2.5', isCorrect: false },
                    { text: '2', isCorrect: true },
                    { text: '3', isCorrect: false },
                    { text: 'Error', isCorrect: false }
                ],
                explanation: 'Integer division in C truncates the fractional part.'
            },
            {
                questionText: 'How do you define a "Constant" that cannot be changed during execution?',
                options: [
                    { text: 'var x = 10;', isCorrect: false },
                    { text: 'const int x = 10;', isCorrect: true },
                    { text: 'static int x = 10;', isCorrect: false },
                    { text: 'extern int x = 10;', isCorrect: false }
                ],
                explanation: 'The "const" keyword makes the variable read-only.'
            },
            {
                questionText: 'What is the use of the "break" statement inside a loop?',
                options: [
                    { text: 'To skip the current iteration.', isCorrect: false },
                    { text: 'To exit the loop immediately.', isCorrect: true },
                    { text: 'To restart the loop.', isCorrect: false },
                    { text: 'To jump to a label.', isCorrect: false }
                ],
                explanation: 'break transfers control to the statement immediately following the loop.'
            },
            {
                questionText: 'Which function is used to read a formatted input from the keyboard?',
                options: [
                    { text: 'printf()', isCorrect: false },
                    { text: 'scanf()', isCorrect: true },
                    { text: 'gets()', isCorrect: false },
                    { text: 'puts()', isCorrect: false }
                ],
                explanation: 'scanf() reads input and stores values according to the format specifiers.'
            },
            {
                questionText: 'What is a "Recursive Function"?',
                options: [
                    { text: 'A function that calls another function.', isCorrect: false },
                    { text: 'A function that calls itself.', isCorrect: true },
                    { text: 'A function that returns a pointer.', isCorrect: false },
                    { text: 'A function that never ends.', isCorrect: false }
                ],
                explanation: 'Recursion is the process of a function calling itself to solve smaller sub-problems.'
            },
            {
                questionText: 'What is the significance of "NULL" in pointers?',
                options: [
                    { text: 'It means the pointer points to address 1.', isCorrect: false },
                    { text: 'It means the pointer doesn\'t point to any valid memory location.', isCorrect: true },
                    { text: 'It is the same as zero.', isCorrect: false },
                    { text: 'It is a special character.', isCorrect: false }
                ],
                explanation: 'NULL is a macro representing a null pointer constant, typically 0 or ((void*)0).'
            },
            {
                questionText: 'What is the "Comma Operator" used for in C?',
                options: [
                    { text: 'To separate function arguments.', isCorrect: false },
                    { text: 'To evaluate multiple expressions and return the rightmost one.', isCorrect: true },
                    { text: 'To define multiple variables of different types.', isCorrect: false },
                    { text: 'To terminate a line.', isCorrect: false }
                ],
                explanation: 'The comma operator evaluates expressions from left to right and results in the value of the last expression.'
            },
            {
                questionText: 'What is the "Sizeof" operator used for?',
                options: [
                    { text: 'To find the size of a file.', isCorrect: false },
                    { text: 'To find the number of bytes occupied by a data type or variable.', isCorrect: true },
                    { text: 'To find the length of a string.', isCorrect: false },
                    { text: 'To find the total number of variables in a program.', isCorrect: false }
                ],
                explanation: 'sizeof is a unary operator that returns the size (in bytes) of its operand.'
            },
            {
                questionText: 'What does "File Handling" in C involve?',
                options: [
                    { text: 'Managing hardware drivers.', isCorrect: false },
                    { text: 'Opening, reading, writing, and closing files using FILE pointers.', isCorrect: true },
                    { text: 'Compressing files into ZIP format.', isCorrect: false },
                    { text: 'Formatting the hard disk.', isCorrect: false }
                ],
                explanation: 'C provides functions like fopen, fread, fwrite, and fclose to manipulate data on external storage.'
            },
            {
                questionText: 'What is an "Enum" in C?',
                options: [
                    { text: 'A shorthand for "External Number".', isCorrect: false },
                    { text: 'A user-defined data type that consists of named integer constants.', isCorrect: true },
                    { text: 'A function that returns an integer.', isCorrect: false },
                    { text: 'A method for error handling.', isCorrect: false }
                ],
                explanation: 'Enumerations (enum) improve code readability by assigning names to whole number constants.'
            }
        ]
    },
    {
        code: 'APT101',
        name: 'Aptitude & Reasoning',
        questions: [
            {
                questionText: 'What is the ratio of 40 minutes to 2 hours?',
                options: [
                    { text: '1:3', isCorrect: true },
                    { text: '1:2', isCorrect: false },
                    { text: '2:3', isCorrect: false },
                    { text: '1:5', isCorrect: false }
                ],
                explanation: '2 hours = 120 minutes. Ratio = 40:120 = 1:3.'
            },
            {
                questionText: 'Find the unit digit in the product (2467)^153 * (341)^72.',
                options: [
                    { text: '7', isCorrect: true },
                    { text: '1', isCorrect: false },
                    { text: '3', isCorrect: false },
                    { text: '9', isCorrect: false }
                ],
                explanation: 'Unit digit of 2467^153 is 7^(153 mod 4) = 7^1 = 7. Unit digit of 341^72 is 1. 7 * 1 = 7.'
            },
            {
                questionText: 'How many factors are there for the number 360?',
                options: [
                    { text: '24', isCorrect: true },
                    { text: '20', isCorrect: false },
                    { text: '18', isCorrect: false },
                    { text: '30', isCorrect: false }
                ],
                explanation: '360 = 2^3 * 3^2 * 5^1. Number of factors = (3+1)(2+1)(1+1) = 4 * 3 * 2 = 24.'
            },
            {
                questionText: 'The ratio of two numbers is 3:4 and their HCF is 4. What is their LCM?',
                options: [
                    { text: '48', isCorrect: true },
                    { text: '12', isCorrect: false },
                    { text: '24', isCorrect: false },
                    { text: '36', isCorrect: false }
                ],
                explanation: 'Numbers are 3*4=12 and 4*4=16. LCM of 12 and 16 is 48.'
            },
            {
                questionText: 'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?',
                options: [
                    { text: '12.5%', isCorrect: true },
                    { text: '10%', isCorrect: false },
                    { text: '15%', isCorrect: false },
                    { text: '8%', isCorrect: false }
                ],
                explanation: 'Interest = Principal. R = (100 * I) / (P * T) = (100 * P) / (P * 8) = 12.5%.'
            },
            {
                questionText: 'Find the number of trailing zeros in 100! (100 factorial).',
                options: [
                    { text: '24', isCorrect: true },
                    { text: '20', isCorrect: false },
                    { text: '25', isCorrect: false },
                    { text: '21', isCorrect: false }
                ],
                explanation: 'Trailing zeros = floor(100/5) + floor(100/25) = 20 + 4 = 24.'
            },
            {
                questionText: 'Which of the following is a prime number?',
                options: [
                    { text: '91', isCorrect: false },
                    { text: '87', isCorrect: false },
                    { text: '97', isCorrect: true },
                    { text: '81', isCorrect: false }
                ],
                explanation: '91 = 7*13, 87 = 3*29, 81 = 3^4. 97 is only divisible by 1 and itself.'
            },
            {
                questionText: 'If A:B = 2:3 and B:C = 4:5, find A:B:C.',
                options: [
                    { text: '8:12:15', isCorrect: true },
                    { text: '2:4:5', isCorrect: false },
                    { text: '8:10:15', isCorrect: false },
                    { text: '4:6:10', isCorrect: false }
                ],
                explanation: 'A:B = 8:12, B:C = 12:15. So A:B:C = 8:12:15.'
            },
            {
                questionText: 'What is the sum of first 50 natural numbers?',
                options: [
                    { text: '1275', isCorrect: true },
                    { text: '1250', isCorrect: false },
                    { text: '1300', isCorrect: false },
                    { text: '2500', isCorrect: false }
                ],
                explanation: 'Sum = n(n+1)/2 = 50*51/2 = 25*51 = 1275.'
            },
            {
                questionText: 'A train 150m long is running at 54 km/hr. How much time will it take to cross a pole?',
                options: [
                    { text: '10 sec', isCorrect: true },
                    { text: '8 sec', isCorrect: false },
                    { text: '15 sec', isCorrect: false },
                    { text: '12 sec', isCorrect: false }
                ],
                explanation: 'Speed = 54 * 5/18 = 15 m/s. Time = Distance/Speed = 150/15 = 10 seconds.'
            },
            {
                questionText: 'What is the binary representation of decimal 25?',
                options: [
                    { text: '11001', isCorrect: true },
                    { text: '10101', isCorrect: false },
                    { text: '11100', isCorrect: false },
                    { text: '11011', isCorrect: false }
                ],
                explanation: '25 = 16 + 8 + 1 = 11001 in binary.'
            },
            {
                questionText: 'Find the average of first five multiples of 3.',
                options: [
                    { text: '9', isCorrect: true },
                    { text: '12', isCorrect: false },
                    { text: '15', isCorrect: false },
                    { text: '10', isCorrect: false }
                ],
                explanation: 'Multiples: 3, 6, 9, 12, 15. Average = (3+15)/2 = 9.'
            },
            {
                questionText: 'In a base system with base 8, what is 7 + 1?',
                options: [
                    { text: '10', isCorrect: true },
                    { text: '8', isCorrect: false },
                    { text: '11', isCorrect: false },
                    { text: '0', isCorrect: false }
                ],
                explanation: 'In base 8, 8 is represented as 10.'
            },
            {
                questionText: 'If 20% of a number is 120, then 120% of that number will be:',
                options: [
                    { text: '720', isCorrect: true },
                    { text: '480', isCorrect: false },
                    { text: '600', isCorrect: false },
                    { text: '144', isCorrect: false }
                ],
                explanation: '20% = 120 => 100% = 600. 120% of 600 = 720.'
            },
            {
                questionText: 'A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price?',
                options: [
                    { text: 'Rs. 1190', isCorrect: true },
                    { text: 'Rs. 1200', isCorrect: false },
                    { text: 'Rs. 1160', isCorrect: false },
                    { text: 'Rs. 1210', isCorrect: false }
                ],
                explanation: 'SP = 85% of 1400 = 0.85 * 1400 = 1190.'
            },
            {
                questionText: 'Find the probability of getting a sum of 7 when two dice are thrown.',
                options: [
                    { text: '1/6', isCorrect: true },
                    { text: '1/12', isCorrect: false },
                    { text: '5/36', isCorrect: false },
                    { text: '1/2', isCorrect: false }
                ],
                explanation: 'Total outcomes = 36. Favorable: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Prob = 6/36 = 1/6.'
            },
            {
                questionText: 'What is the value of (0.5)^3?',
                options: [
                    { text: '0.125', isCorrect: true },
                    { text: '0.25', isCorrect: false },
                    { text: '0.0125', isCorrect: false },
                    { text: '1.25', isCorrect: false }
                ],
                explanation: '0.5 * 0.5 * 0.5 = 0.125.'
            },
            {
                questionText: 'The population of a town increases by 5% annually. If current population is 10000, what will it be after 2 years?',
                options: [
                    { text: '11025', isCorrect: true },
                    { text: '11000', isCorrect: false },
                    { text: '10500', isCorrect: false },
                    { text: '11125', isCorrect: false }
                ],
                explanation: '10000 * 1.05 * 1.05 = 11025.'
            },
            {
                questionText: 'Find the simple interest on Rs. 5000 at 10% per annum for 3 years.',
                options: [
                    { text: 'Rs. 1500', isCorrect: true },
                    { text: 'Rs. 500', isCorrect: false },
                    { text: 'Rs. 1000', isCorrect: false },
                    { text: 'Rs. 2000', isCorrect: false }
                ],
                explanation: 'SI = P*R*T/100 = 5000*10*3/100 = 1500.'
            },
            {
                questionText: '3, 5, 9, 17, 33, ?',
                options: [
                    { text: '65', isCorrect: true },
                    { text: '60', isCorrect: false },
                    { text: '49', isCorrect: false },
                    { text: '66', isCorrect: false }
                ],
                explanation: 'Differences are 2, 4, 8, 16... next is 32. 33 + 32 = 65.'
            },
            {
                questionText: 'What is 10% of 20% of 300?',
                options: [
                    { text: '6', isCorrect: true },
                    { text: '60', isCorrect: false },
                    { text: '3', isCorrect: false },
                    { text: '30', isCorrect: false }
                ],
                explanation: '20% of 300 = 60. 10% of 60 = 6.'
            },
            {
                questionText: 'If 5 workers can build a wall in 12 days, how many days will 10 workers take?',
                options: [
                    { text: '6 days', isCorrect: true },
                    { text: '24 days', isCorrect: false },
                    { text: '8 days', isCorrect: false },
                    { text: '5 days', isCorrect: false }
                ],
                explanation: 'Work = 5 * 12 = 60 man-days. 60 / 10 = 6 days.'
            },
            {
                questionText: 'Identify the odd one out: 4, 9, 16, 20, 25, 36.',
                options: [
                    { text: '20', isCorrect: true },
                    { text: '16', isCorrect: false },
                    { text: '25', isCorrect: false },
                    { text: '36', isCorrect: false }
                ],
                explanation: 'All others are perfect squares (2^2, 3^2, 4^2, 5^2, 6^2).'
            },
            {
                questionText: 'What is the HCF of 24 and 60?',
                options: [
                    { text: '12', isCorrect: true },
                    { text: '6', isCorrect: false },
                    { text: '24', isCorrect: false },
                    { text: '4', isCorrect: false }
                ],
                explanation: '24 = 12*2, 60 = 12*5. 12 is the highest common factor.'
            },
            {
                questionText: 'A rectangle has length 10cm and width 5cm. What is its perimeter?',
                options: [
                    { text: '30cm', isCorrect: true },
                    { text: '50cm', isCorrect: false },
                    { text: '15cm', isCorrect: false },
                    { text: '20cm', isCorrect: false }
                ],
                explanation: 'Perimeter = 2(l + w) = 2(10 + 5) = 30cm.'
            },
            {
                questionText: 'If x + y = 20 and x - y = 4, then x = ?',
                options: [
                    { text: '12', isCorrect: true },
                    { text: '8', isCorrect: false },
                    { text: '16', isCorrect: false },
                    { text: '10', isCorrect: false }
                ],
                explanation: 'Adding both equations: 2x = 24 => x = 12.'
            },
            {
                questionText: 'What is 3/4 as a percentage?',
                options: [
                    { text: '75%', isCorrect: true },
                    { text: '60%', isCorrect: false },
                    { text: '80%', isCorrect: false },
                    { text: '34%', isCorrect: false }
                ],
                explanation: '3/4 * 100 = 75%.'
            },
            {
                questionText: 'A clock shows 3:00. What is the angle between the hour and minute hands?',
                options: [
                    { text: '90 degrees', isCorrect: true },
                    { text: '180 degrees', isCorrect: false },
                    { text: '45 degrees', isCorrect: false },
                    { text: '120 degrees', isCorrect: false }
                ],
                explanation: 'The minute hand is at 12 and hour hand is at 3. Angle = 3 * 30 = 90 degrees.'
            },
            {
                questionText: 'If JAN = 10, then MAR = ?',
                options: [
                    { text: '13', isCorrect: true },
                    { text: '12', isCorrect: false },
                    { text: '14', isCorrect: false },
                    { text: '3', isCorrect: false }
                ],
                explanation: 'Code is the numerical position of the first letter (J=10, M=13).'
            },
            {
                questionText: 'What is the next number in the series? 1, 4, 9, 16, 25, ?',
                options: [
                    { text: '36', isCorrect: true },
                    { text: '30', isCorrect: false },
                    { text: '49', isCorrect: false },
                    { text: '40', isCorrect: false }
                ],
                explanation: 'The series consists of squares of natural numbers (1^2, 2^2, 3^2, 4^2, 5^2, 6^2).'
            }
        ]
    },
    {
        code: 'CS302',
        name: 'Computer Organization and Architecture',
        questions: [
            {
                questionText: 'Which cache mapping technique allows a block of main memory to be placed in ANY cache line?',
                options: [
                    { text: 'Direct Mapping', isCorrect: false },
                    { text: 'Fully Associative Mapping', isCorrect: true },
                    { text: 'Set Associative Mapping', isCorrect: false },
                    { text: 'Vector Mapping', isCorrect: false }
                ],
                explanation: 'Fully associative mapping provides the most flexibility as any memory block can go into any cache line.'
            },
            {
                questionText: 'What does the "IEEE 754" standard define?',
                options: [
                    { text: 'CPU Instruction Set', isCorrect: false },
                    { text: 'Floating Point Arithmetic representation', isCorrect: true },
                    { text: 'Cache replacement policies', isCorrect: false },
                    { text: 'Bus protocols', isCorrect: false }
                ],
                explanation: 'IEEE 754 is the standard for floating point representation using sign, exponent, and mantissa.'
            },
            {
                questionText: 'Which addressing mode specifies the operand directly within the instruction?',
                options: [
                    { text: 'Immediate Addressing', isCorrect: true },
                    { text: 'Direct Addressing', isCorrect: false },
                    { text: 'Register Indirect', isCorrect: false },
                    { text: 'Indexed Addressing', isCorrect: false }
                ],
                explanation: 'In immediate addressing, the operand is a constant values that is part of the instruction itself.'
            },
            {
                questionText: 'What is the purpose of the "Program Counter" (PC)?',
                options: [
                    { text: 'To store the result of an arithmetic operation.', isCorrect: false },
                    { text: 'To hold the address of the next instruction to be fetched.', isCorrect: true },
                    { text: 'To store the current instruction being executed.', isCorrect: false },
                    { text: 'To manage the stack pointer.', isCorrect: false }
                ],
                explanation: 'The PC keeps track of where the processor is in the program sequence.'
            },
            {
                questionText: 'Which algorithm is commonly used for fast binary multiplication of signed numbers?',
                options: [
                    { text: 'Dijkstra\'s Algorithm', isCorrect: false },
                    { text: 'Booth\'s Algorithm', isCorrect: true },
                    { text: 'Prim\'s Algorithm', isCorrect: false },
                    { text: 'RSA Algorithm', isCorrect: false }
                ],
                explanation: 'Booth\'s multiplication algorithm treats groups of 1s in a multiplier as a single operation, improving efficiency for signed numbers.'
            },
            {
                questionText: 'What characterizes a RISC architecture?',
                options: [
                    { text: 'Large set of complex instructions.', isCorrect: false },
                    { text: 'Simple instructions that take one clock cycle.', isCorrect: true },
                    { text: 'Variable length instructions.', isCorrect: false },
                    { text: 'Extensive use of microprogramming.', isCorrect: false }
                ],
                explanation: 'Reduced Instruction Set Computer (RISC) focuses on small, highly optimized instruction sets.'
            },
            {
                questionText: 'In a memory hierarchy, which type of memory is the fastest?',
                options: [
                    { text: 'Main Memory (RAM)', isCorrect: false },
                    { text: 'Registers', isCorrect: true },
                    { text: 'L2 Cache', isCorrect: false },
                    { text: 'Hard Disk', isCorrect: false }
                ],
                explanation: 'Registers are located directly inside the CPU and operate at the CPU clock speed.'
            },
            {
                questionText: 'What is "Pipelining" in computer architecture?',
                options: [
                    { text: 'Connecting multiple CPUs together.', isCorrect: false },
                    { text: 'Overlapping the execution of multiple instructions.', isCorrect: true },
                    { text: 'Increasing the size of the data bus.', isCorrect: false },
                    { text: 'Using virtual memory.', isCorrect: false }
                ],
                explanation: 'Pipelining divides instruction execution into stages so that different stages of different instructions can run concurrently.'
            },
            {
                questionText: 'Which hazard occurs when an instruction depends on the result of a previous instruction?',
                options: [
                    { text: 'Structural Hazard', isCorrect: false },
                    { text: 'Data Hazard', isCorrect: true },
                    { text: 'Control Hazard', isCorrect: false },
                    { text: 'Interrupt Hazard', isCorrect: false }
                ],
                explanation: 'Data hazards occur when instructions that exhibit data dependence overlap in the pipeline.'
            },
            {
                questionText: 'What is the role of the "ALU"?',
                options: [
                    { text: 'Management of I/O devices.', isCorrect: false },
                    { text: 'Performing arithmetic and logical operations.', isCorrect: true },
                    { text: 'Storing large amounts of data.', isCorrect: false },
                    { text: 'Fetching instructions from memory.', isCorrect: false }
                ],
                explanation: 'The Arithmetic Logic Unit (ALU) is the "calculator" of the CPU.'
            },
            {
                questionText: 'What does "Write-Back" policy in cache management mean?',
                options: [
                    { text: 'Updating main memory immediately on every write.', isCorrect: false },
                    { text: 'Updating memory only when the cache line is replaced.', isCorrect: true },
                    { text: 'Disabling writes to the cache.', isCorrect: false },
                    { text: 'Writing data to secondary storage first.', isCorrect: false }
                ],
                explanation: 'Write-back improves performance by reducing the number of writes to main memory.'
            },
            {
                questionText: 'What is a "Control Unit" responsible for?',
                options: [
                    { text: 'Executing additions.', isCorrect: false },
                    { text: 'Generating signals to coordinate other components.', isCorrect: true },
                    { text: 'Holding current data values.', isCorrect: false },
                    { text: 'Interfacing with the user.', isCorrect: false }
                ],
                explanation: 'The control unit directs the flow of data and instructions within the CPU.'
            },
            {
                questionText: 'How many bits are in a 64-bit architecture\'s "Word"?',
                options: [
                    { text: '64', isCorrect: true },
                    { text: '32', isCorrect: false },
                    { text: '8', isCorrect: false },
                    { text: '16', isCorrect: false }
                ],
                explanation: 'The word size matches the architecture\'s name, defining the natural size for data processing.'
            },
            {
                questionText: 'What is "Direct Memory Access" (DMA) used for?',
                options: [
                    { text: 'CPU to access registers faster.', isCorrect: false },
                    { text: 'I/O devices to transfer data directly to/from memory without CPU intervention.', isCorrect: true },
                    { text: 'Memory to store code.', isCorrect: false },
                    { text: 'Users to access the database.', isCorrect: false }
                ],
                explanation: 'DMA offloads data transfer tasks from the CPU, allowing the CPU to perform other work.'
            },
            {
                questionText: 'Which complement system is used to represent -5 in 4-bit binary?',
                options: [
                    { text: '1011 (2\'s Complement)', isCorrect: true },
                    { text: '1101', isCorrect: false },
                    { text: '0101', isCorrect: false },
                    { text: '1010', isCorrect: false }
                ],
                explanation: '+5 is 0101. 1\'s comp is 1010. 2\'s comp is 1011.'
            },
            {
                questionText: 'What is the "Hit Ratio" in cache memory?',
                options: [
                    { text: 'Number of cache misses / Total accesses.', isCorrect: false },
                    { text: 'Number of cache hits / Total memory accesses.', isCorrect: true },
                    { text: 'Cache size / RAM size.', isCorrect: false },
                    { text: 'Number of CPU cycles / Memory cycles.', isCorrect: false }
                ],
                explanation: 'Hit ratio measures the effectiveness of the cache in satisfying memory requests.'
            },
            {
                questionText: 'What defines "Little Endian" byte order?',
                options: [
                    { text: 'Most significant byte is stored at the lowest address.', isCorrect: false },
                    { text: 'Least significant byte is stored at the lowest address.', isCorrect: true },
                    { text: 'Bytes are stored in random order.', isCorrect: false },
                    { text: 'Bytes are encrypted.', isCorrect: false }
                ],
                explanation: 'In little-endian, the lower-value byte comes first in memory.'
            },
            {
                questionText: 'Which of the following is an "External" interrupt?',
                options: [
                    { text: 'Division by zero', isCorrect: false },
                    { text: 'Keyboard input ready', isCorrect: true },
                    { text: 'Page fault', isCorrect: false },
                    { text: 'Invalid instruction', isCorrect: false }
                ],
                explanation: 'External interrupts are generated by hardware devices outside the CPU.'
            },
            {
                questionText: 'What is the "Micro-instruction"?',
                options: [
                    { text: 'A small C program.', isCorrect: false },
                    { text: 'A basic control signal within the control unit.', isCorrect: true },
                    { text: 'An instruction for a mobile device.', isCorrect: false },
                    { text: 'A variable name.', isCorrect: false }
                ],
                explanation: 'Micro-instructions are the lowest level instructions that control the CPU\'s internal data paths.'
            },
            {
                questionText: 'What is "SRAM" primarily used for?',
                options: [
                    { text: 'Main Memory.', isCorrect: false },
                    { text: 'Cache Memory.', isCorrect: true },
                    { text: 'Registers.', isCorrect: false },
                    { text: 'Hard Disks.', isCorrect: false }
                ],
                explanation: 'Static RAM is faster and more expensive than Dynamic RAM, making it ideal for cache.'
            },
            {
                questionText: 'What is the purpose of "Virtual Memory"?',
                options: [
                    { text: 'To increase the speed of the CPU.', isCorrect: false },
                    { text: 'To allow programs larger than physical memory to run.', isCorrect: true },
                    { text: 'To store temporary internet files.', isCorrect: false },
                    { text: 'To protect the BIOS.', isCorrect: false }
                ],
                explanation: 'Virtual memory uses disk space to simulate additional RAM.'
            },
            {
                questionText: 'Which register holds the current instruction being executed?',
                options: [
                    { text: 'Program Counter', isCorrect: false },
                    { text: 'Instruction Register (IR)', isCorrect: true },
                    { text: 'Accumulator', isCorrect: false },
                    { text: 'Stack Pointer', isCorrect: false }
                ],
                explanation: 'The IR stores the instruction bit pattern currently being decoded.'
            },
            {
                questionText: 'What is "Thrashing"?',
                options: [
                    { text: 'High CPU utilization.', isCorrect: false },
                    { text: 'Excessive page swapping that degrades system performance.', isCorrect: true },
                    { text: 'Formatting the memory.', isCorrect: false },
                    { text: 'Overclocking the processor.', isCorrect: false }
                ],
                explanation: 'Thrashing occurs when the system spends more time moving pages in and out of memory than executing processes.'
            },
            {
                questionText: 'What is "Locality of Reference"?',
                options: [
                    { text: 'Keeping variables close together in code.', isCorrect: false },
                    { text: 'The tendency of a processor to access the same set of memory locations repetitively over a short period.', isCorrect: true },
                    { text: 'Accessing memory in random order.', isCorrect: false },
                    { text: 'Storing files on a local server.', isCorrect: false }
                ],
                explanation: 'Locality (temporal and spatial) is the fundamental principle that makes caching effective.'
            },
            {
                questionText: 'What does "Von Neumann" architecture propose?',
                options: [
                    { text: 'Separate memory for data and instructions.', isCorrect: false },
                    { text: 'Stored-program concept where data and instructions share the same memory.', isCorrect: true },
                    { text: 'Using only one register.', isCorrect: false },
                    { text: 'Parallel processing only.', isCorrect: false }
                ],
                explanation: 'The Von Neumann bottleneck refers to the shared bus for data and instructions in this model.'
            },
            {
                questionText: 'What is an "ALU Flag"?',
                options: [
                    { text: 'A decorative item in the CPU.', isCorrect: false },
                    { text: 'A single bit that indicates a condition like zero, carry, or overflow.', isCorrect: true },
                    { text: 'A large integer result.', isCorrect: false },
                    { text: 'A signal to stop the CPU.', isCorrect: false }
                ],
                explanation: 'Flags in the status register reflect the results of the most recent ALU operation.'
            },
            {
                questionText: 'What is "Symbolic Addressing"?',
                options: [
                    { text: 'Using variable names instead of absolute memory addresses.', isCorrect: true },
                    { text: 'Using icons to represent memory.', isCorrect: false },
                    { text: 'Addressing memory using binary codes.', isCorrect: false },
                    { text: 'A feature of the GPU.', isCorrect: false }
                ],
                explanation: 'Assembly language uses labels/symbols which the assembler converts into numeric addresses.'
            },
            {
                questionText: 'What is the role of the "Stack Pointer" (SP)?',
                options: [
                    { text: 'To point to the bottom of the memory.', isCorrect: false },
                    { text: 'To keep track of the top of the stack in memory.', isCorrect: true },
                    { text: 'To count the number of instructions.', isCorrect: false },
                    { text: 'To manage the heap.', isCorrect: false }
                ],
                explanation: 'The SP is used for subroutines and interrupts to store return addresses and local variables.'
            },
            {
                questionText: 'Which bus is Bidirectional?',
                options: [
                    { text: 'Address Bus', isCorrect: false },
                    { text: 'Data Bus', isCorrect: true },
                    { text: 'Control Bus (Generic output part)', isCorrect: false },
                    { text: 'Power Bus', isCorrect: false }
                ],
                explanation: 'The Data Bus must allow transfer of data both to and from the CPU.'
            },
            {
                questionText: 'What is "Micro-programming"?',
                options: [
                    { text: 'Programming small robots.', isCorrect: false },
                    { text: 'Defining a control unit\'s logic using a sequence of micro-instructions in a control store.', isCorrect: true },
                    { text: 'Debugging very small errors.', isCorrect: false },
                    { text: 'Using a simplified version of C.', isCorrect: false }
                ],
                explanation: 'Micro-programming makes the control unit more flexible and easier to design for complex instructions.'
            }
        ]
    },
    {
        code: 'CS306',
        name: 'Data Structures',
        questions: [
            {
                questionText: 'What is the "Big O" complexity of searching for an element in a balanced Binary Search Tree (BST)?',
                options: [
                    { text: 'O(1)', isCorrect: false },
                    { text: 'O(n)', isCorrect: false },
                    { text: 'O(log n)', isCorrect: true },
                    { text: 'O(n log n)', isCorrect: false }
                ],
                explanation: 'In a balanced BST, each comparison eliminates half of the remaining nodes, leading to logarithmic time complexity.'
            },
            {
                questionText: 'In a Stack, if we push elements 1, 2, 3 in order, what will be the order of elements when we pop them?',
                options: [
                    { text: '1, 2, 3', isCorrect: false },
                    { text: '3, 2, 1', isCorrect: true },
                    { text: '2, 1, 3', isCorrect: false },
                    { text: 'Random order', isCorrect: false }
                ],
                explanation: 'Stacks follow the LIFO (Last-In-First-Out) principle, so the last pushed element is the first to be popped.'
            },
            {
                questionText: 'Which function is used for dynamic memory allocation of an array with zero-initialization in C?',
                options: [
                    { text: 'malloc()', isCorrect: false },
                    { text: 'calloc()', isCorrect: true },
                    { text: 'realloc()', isCorrect: false },
                    { text: 'alloc()', isCorrect: false }
                ],
                explanation: 'calloc() allocates memory and initializes all bits to zero, unlike malloc().'
            },
            {
                questionText: 'What is a "Self-Referential Structure"?',
                options: [
                    { text: 'A structure that contains a pointer to itself.', isCorrect: true },
                    { text: 'A structure that has no members.', isCorrect: false },
                    { text: 'A structure that is defined inside another structure.', isCorrect: false },
                    { text: 'A structure that is used only once.', isCorrect: false }
                ],
                explanation: 'Self-referential structures (containing a pointer to the same structure type) are the basis for linked lists and trees.'
            },
            {
                questionText: 'What is the time complexity to insert a node at the beginning of a singly linked list?',
                options: [
                    { text: 'O(n)', isCorrect: false },
                    { text: 'O(1)', isCorrect: true },
                    { text: 'O(log n)', isCorrect: false },
                    { text: 'O(n^2)', isCorrect: false }
                ],
                explanation: 'Inserting at the head only requires updating the new node\'s next pointer and the head pointer, which is an O(1) operation.'
            },
            {
                questionText: 'Which data structure is best suited for implementing a "Undo" feature in software?',
                options: [
                    { text: 'Queue', isCorrect: false },
                    { text: 'Stack', isCorrect: true },
                    { text: 'Tree', isCorrect: false },
                    { text: 'Hash Table', isCorrect: false }
                ],
                explanation: 'The most recent action needs to be undone first, which is perfectly modeled by the LIFO behavior of a Stack.'
            },
            {
                questionText: 'What is a "Circular Linked List"?',
                options: [
                    { text: 'A list with no nodes.', isCorrect: false },
                    { text: 'A list where the last node points back to the first node.', isCorrect: true },
                    { text: 'A list that has an even number of nodes.', isCorrect: false },
                    { text: 'A list that stores circles.', isCorrect: false }
                ],
                explanation: 'In a circular linked list, there is no NULL at the end; the "tail" connects to the "head".'
            },
            {
                questionText: 'What does "FIFO" stand for in data structures?',
                options: [
                    { text: 'Fast In Fast Out', isCorrect: false },
                    { text: 'First In First Out', isCorrect: true },
                    { text: 'File In File Out', isCorrect: false },
                    { text: 'First Input First Output', isCorrect: false }
                ],
                explanation: 'FIFO is the characteristic behavior of a Queue, where the first element added is the first to be removed.'
            },
            {
                questionText: 'In infix to postfix conversion, what is the postfix of "A+B*C"?',
                options: [
                    { text: 'ABC*+', isCorrect: true },
                    { text: 'AB+C*', isCorrect: false },
                    { text: 'ABC+*', isCorrect: false },
                    { text: '*+ABC', isCorrect: false }
                ],
                explanation: 'Using operator precedence (* before +), the expression becomes (A + (B * C)), which translates to ABC*+.'
            },
            {
                questionText: 'What is an "AVL Tree"?',
                options: [
                    { text: 'A tree with exactly 3 children per node.', isCorrect: false },
                    { text: 'A self-balancing Binary Search Tree where height difference of subtrees is at most 1.', isCorrect: true },
                    { text: 'A tree used for audio-visual data.', isCorrect: false },
                    { text: 'A completely empty tree.', isCorrect: false }
                ],
                explanation: 'AVL trees maintain balance through rotations, ensuring O(log n) time complexity for operations.'
            },
            {
                questionText: 'What is the "Tail" of a queue?',
                options: [
                    { text: 'The point where elements are removed.', isCorrect: false },
                    { text: 'The point where elements are inserted.', isCorrect: true },
                    { text: 'The middle of the queue.', isCorrect: false },
                    { text: 'A pointer to NULL.', isCorrect: false }
                ],
                explanation: 'In a queue, insertion (enqueue) happens at the tail/rear, and removal (dequeue) happens at the head/front.'
            },
            {
                questionText: 'What is a "Dangling Pointer"?',
                options: [
                    { text: 'A pointer that points to a valid memory location.', isCorrect: false },
                    { text: 'A pointer that points to memory that has been deallocated.', isCorrect: true },
                    { text: 'A pointer that is initialized to zero.', isCorrect: false },
                    { text: 'A pointer used in recursion.', isCorrect: false }
                ],
                explanation: 'Accessing a dangling pointer leads to undefined behavior as the memory it points to no longer belongs to the program.'
            },
            {
                questionText: 'Which traversal of a BST results in sorted order of elements?',
                options: [
                    { text: 'Pre-order', isCorrect: false },
                    { text: 'In-order', isCorrect: true },
                    { text: 'Post-order', isCorrect: false },
                    { text: 'Level-order', isCorrect: false }
                ],
                explanation: 'In-order traversal (Left-Root-Right) visits nodes in ascending order in a BST.'
            },
            {
                questionText: 'What is "Dynamic Memory Allocation"?',
                options: [
                    { text: 'Allocating memory at compile time.', isCorrect: false },
                    { text: 'Allocating memory during program execution from the heap.', isCorrect: true },
                    { text: 'Using registers only.', isCorrect: false },
                    { text: 'Allocating memory in the stack.', isCorrect: false }
                ],
                explanation: 'Dynamic allocation allows programs to request the exact amount of memory they need at runtime.'
            },
            {
                questionText: 'Which function is used to resize a previously allocated memory block?',
                options: [
                    { text: 'malloc()', isCorrect: false },
                    { text: 'resize()', isCorrect: false },
                    { text: 'realloc()', isCorrect: true },
                    { text: 'change()', isCorrect: false }
                ],
                explanation: 'realloc() can increase or decrease the size of a block while attempting to preserve the contents.'
            },
            {
                questionText: 'What is a "Binary Tree"?',
                options: [
                    { text: 'A tree with exactly two nodes.', isCorrect: false },
                    { text: 'A tree where each node has at most two children.', isCorrect: true },
                    { text: 'A tree that stores binary numbers.', isCorrect: false },
                    { text: 'A tree with no roots.', isCorrect: false }
                ],
                explanation: 'Binary trees are a hierarchical structure where each node can have a left child and a right child.'
            },
            {
                questionText: 'In a Doubly Linked List, each node contains how many pointers?',
                options: [
                    { text: '1', isCorrect: false },
                    { text: '2', isCorrect: true },
                    { text: '3', isCorrect: false },
                    { text: '0', isCorrect: false }
                ],
                explanation: 'Each node has a "next" pointer and a "prev" pointer, allowing bi-directional traversal.'
            },
            {
                questionText: 'What is the "Height" of a tree?',
                options: [
                    { text: 'The number of nodes in the tree.', isCorrect: false },
                    { text: 'The number of levels in the tree.', isCorrect: false },
                    { text: 'The number of edges on the longest path from the root to a leaf.', isCorrect: true },
                    { text: 'The number of leaves.', isCorrect: false }
                ],
                explanation: 'Height measures the maximum depth of the tree from the root node.'
            },
            {
                questionText: 'What is a "Priority Queue"?',
                options: [
                    { text: 'A queue where only numbers are stored.', isCorrect: false },
                    { text: 'A queue where each element has a priority, and higher priority elements are served first.', isCorrect: true },
                    { text: 'A queue that is faster than others.', isCorrect: false },
                    { text: 'A queue used only by the OS.', isCorrect: false }
                ],
                explanation: 'Priority queues do not necessarily follow FIFO; they serve elements based on their assigned priority.'
            },
            {
                questionText: 'What is "Polynomial Arithmetic" in data structures?',
                options: [
                    { text: 'Representing and performing operations on polynomials using linked lists or arrays.', isCorrect: true },
                    { text: 'Calculating complex integrals.', isCorrect: false },
                    { text: 'Solving quadratic equations only.', isCorrect: false },
                    { text: 'A way to sort data.', isCorrect: false }
                ],
                explanation: 'Polynomials are often stored as a list of coefficient-exponent pairs for efficient addition and multiplication.'
            },
            {
                questionText: 'What is the space complexity of an adjacency matrix for a graph with "v" vertices?',
                options: [
                    { text: 'O(v^2)', isCorrect: true },
                    { text: 'O(v)', isCorrect: false },
                    { text: 'O(log v)', isCorrect: false },
                    { text: 'O(e)', isCorrect: false }
                ],
                explanation: 'An adjacency matrix is a 2D array of size v x v, hence O(v^2) space.'
            },
            {
                questionText: 'In a Min-Heap, the root always contains the:',
                options: [
                    { text: 'Smallest element', isCorrect: true },
                    { text: 'Largest element', isCorrect: false },
                    { text: 'Median element', isCorrect: false },
                    { text: 'Sum of all elements', isCorrect: false }
                ],
                explanation: 'A Min-Heap is a specialized complete tree where every parent node has a value smaller than its children.'
            },
            {
                questionText: 'What is the "Load Factor" of a hash table?',
                options: [
                    { text: 'Number of elements / Number of buckets.', isCorrect: true },
                    { text: 'Number of collisions.', isCorrect: false },
                    { text: 'The time taken to hash a key.', isCorrect: false },
                    { text: 'The size of the table.', isCorrect: false }
                ],
                explanation: 'Load factor indicates how full the hash table is and helps decide when to resize.'
            },
            {
                questionText: 'What is "Collision" in Hashing?',
                options: [
                    { text: 'When two different keys produce the same hash value.', isCorrect: true },
                    { text: 'When the program crashes.', isCorrect: false },
                    { text: 'When the table is empty.', isCorrect: false },
                    { text: 'When the hash function is too slow.', isCorrect: false }
                ],
                explanation: 'Collisions are inevitable when mapping a large keyspace to a smaller table size.'
            },
            {
                questionText: 'Which graph traversal uses a Queue?',
                options: [
                    { text: 'BFS', isCorrect: true },
                    { text: 'DFS', isCorrect: false },
                    { text: 'Dijkstra\'s', isCorrect: false },
                    { text: 'Kruskal\'s', isCorrect: false }
                ],
                explanation: 'Breadth-First Search visits neighbors level by level using a FIFO queue.'
            },
            {
                questionText: 'What is a "Complete Binary Tree"?',
                options: [
                    { text: 'A tree where all levels are filled except possibly the last, which is filled from left to right.', isCorrect: true },
                    { text: 'A tree where all levels are completely filled.', isCorrect: false },
                    { text: 'A tree where every node has 2 children.', isCorrect: false },
                    { text: 'A tree with no branches.', isCorrect: false }
                ],
                explanation: 'Complete binary trees are often used for heap implementations due to their array-friendliness.'
            },
            {
                questionText: 'What is "Dynamic Programming" primary idea?',
                options: [
                    { text: 'Solving a problem by breaking it into subproblems and storing results to avoid recomputation.', isCorrect: true },
                    { text: 'Using a lot of memory.', isCorrect: false },
                    { text: 'Solving problems in real-time.', isCorrect: false },
                    { text: 'Writing code that changes itself.', isCorrect: false }
                ],
                explanation: 'DP uses memoization or tabulation to optimize recursive solutions with overlapping subproblems.'
            },
            {
                questionText: 'What is the "Worst-case" time complexity of Quicksort?',
                options: [
                    { text: 'O(n^2)', isCorrect: true },
                    { text: 'O(n log n)', isCorrect: false },
                    { text: 'O(n)', isCorrect: false },
                    { text: 'O(log n)', isCorrect: false }
                ],
                explanation: 'Worst case occurs when the pivot always partitions the array into one element and n-1 elements.'
            },
            {
                questionText: 'What is "Amortized Analysis"?',
                options: [
                    { text: 'Finding the average time per operation over a sequence of operations.', isCorrect: true },
                    { text: 'Finding the average case complexity.', isCorrect: false },
                    { text: 'A way to delete memory.', isCorrect: false },
                    { text: 'A sorting algorithm.', isCorrect: false }
                ],
                explanation: 'Amortized analysis accounts for occasional expensive operations spread over many cheap ones (e.g., dynamic array resizing).'
            },
            {
                questionText: 'In a B-Tree, nodes are kept at least half-full to:',
                options: [
                    { text: 'Minimize disk accesses by maintaining a balanced structure.', isCorrect: true },
                    { text: 'Save memory.', isCorrect: false },
                    { text: 'Make searching faster.', isCorrect: false },
                    { text: 'Allow more children.', isCorrect: false }
                ],
                explanation: 'B-Trees are optimized for systems where data is stored on disk and read in blocks.'
            }
        ]
    },
    {
        code: 'CS304',
        name: 'JAVA',
        questions: [
            {
                questionText: 'What does "JVM" stand for?',
                options: [
                    { text: 'Java Virtual Machine', isCorrect: true },
                    { text: 'Java Virtual Memory', isCorrect: false },
                    { text: 'Java Visual Machine', isCorrect: false },
                    { text: 'Java Variable Method', isCorrect: false }
                ],
                explanation: 'The JVM is the engine that provides the runtime environment to drive Java Code/Applications.'
            },
            {
                questionText: 'What is the difference between JDK and JRE?',
                options: [
                    { text: 'JDK includes tools like javac for development, while JRE is only for running Java programs.', isCorrect: true },
                    { text: 'JDK is for running, JRE is for developing.', isCorrect: false },
                    { text: 'They are the same thing.', isCorrect: false },
                    { text: 'JRE is faster than JDK.', isCorrect: false }
                ],
                explanation: 'JDK = Development Tools + JRE. JRE = JVM + Library Classes.'
            },
            {
                questionText: 'Which keyword is used to refer to a parent class object in Java?',
                options: [
                    { text: 'super', isCorrect: true },
                    { text: 'this', isCorrect: false },
                    { text: 'parent', isCorrect: false },
                    { text: 'base', isCorrect: false }
                ],
                explanation: 'The "super" keyword is used to access members of the parent class (superclass).'
            },
            {
                questionText: 'What happens when you declare a method as "final"?',
                options: [
                    { text: 'It cannot be overridden by subclasses.', isCorrect: true },
                    { text: 'It cannot be called.', isCorrect: false },
                    { text: 'It can only be called once.', isCorrect: false },
                    { text: 'It is automatically static.', isCorrect: false }
                ],
                explanation: 'Preventing overrides ensures a specific implementation is preserved across the inheritance hierarchy.'
            },
            {
                questionText: 'Which of the following is a "Reference Type" in Java?',
                options: [
                    { text: 'String', isCorrect: true },
                    { text: 'int', isCorrect: false },
                    { text: 'double', isCorrect: false },
                    { text: 'boolean', isCorrect: false }
                ],
                explanation: 'Strings are objects in Java, whereas int, double, and boolean are primitive types.'
            },
            {
                questionText: 'What is "Method Overloading"?',
                options: [
                    { text: 'Defining multiple methods with the same name but different parameters in the same class.', isCorrect: true },
                    { text: 'Changing the implementation of a parent method.', isCorrect: false },
                    { text: 'Defining too many methods in a class.', isCorrect: false },
                    { text: 'Calling a method recursively.', isCorrect: false }
                ],
                explanation: 'Overloading allows methods to perform similar tasks with different input types or counts.'
            },
            {
                questionText: 'Which access modifier allows visibility ONLY within the same class?',
                options: [
                    { text: 'private', isCorrect: true },
                    { text: 'public', isCorrect: false },
                    { text: 'protected', isCorrect: false },
                    { text: 'default (package-private)', isCorrect: false }
                ],
                explanation: 'Private members are encapsulated and hidden from outside access.'
            },
            {
                questionText: 'What is an "Interface" in Java?',
                options: [
                    { text: 'A blueprint of a class that can contain constants and abstract methods.', isCorrect: true },
                    { text: 'A type of class that can be instantiated.', isCorrect: false },
                    { text: 'A UI component.', isCorrect: false },
                    { text: 'A way to connect to a database.', isCorrect: false }
                ],
                explanation: 'Interfaces define "what" a class must do, but not "how" (until default/static methods in later Java versions).'
            },
            {
                questionText: 'Which class is the root of all classes in Java?',
                options: [
                    { text: 'Object', isCorrect: true },
                    { text: 'String', isCorrect: false },
                    { text: 'System', isCorrect: false },
                    { text: 'Class', isCorrect: false }
                ],
                explanation: 'Every class in Java implicitly extends the Object class.'
            },
            {
                questionText: 'What is "Exception Handling"?',
                options: [
                    { text: 'A mechanism to handle runtime errors so the normal flow of the program can be maintained.', isCorrect: true },
                    { text: 'A way to ignore errors.', isCorrect: false },
                    { text: 'Formatting the source code.', isCorrect: false },
                    { text: 'Upgrading Java versions.', isCorrect: false }
                ],
                explanation: 'Try-catch blocks are used to intercept exceptions and prevent application crashes.'
            },
            {
                questionText: 'What is the purpose of the "finally" block?',
                options: [
                    { text: 'To execute code regardless of whether an exception occurred or not.', isCorrect: true },
                    { text: 'To stop the program.', isCorrect: false },
                    { text: 'To catch specific errors.', isCorrect: false },
                    { text: 'To speed up execution.', isCorrect: false }
                ],
                explanation: 'Finally is typically used for cleanup tasks like closing files or socket connections.'
            },
            {
                questionText: 'What is "Encapsulation"?',
                options: [
                    { text: 'Hiding data behind methods to control access.', isCorrect: true },
                    { text: 'Making code run faster.', isCorrect: false },
                    { text: 'Inheritance from multiple classes.', isCorrect: false },
                    { text: 'Writing comments.', isCorrect: false }
                ],
                explanation: 'Encapsulation binds data and code together and protects it from outside interference.'
            },
            {
                questionText: 'Which collection class allows storing elements in a dynamic array?',
                options: [
                    { text: 'ArrayList', isCorrect: true },
                    { text: 'HashMap', isCorrect: false },
                    { text: 'HashSet', isCorrect: false },
                    { text: 'LinkedList', isCorrect: false }
                ],
                explanation: 'ArrayList implements the List interface using a resizable array.'
            },
            {
                questionText: 'What is "Autoboxing"?',
                options: [
                    { text: 'Automatic conversion of primitives to their corresponding wrapper classes.', isCorrect: true },
                    { text: 'Generating code automatically.', isCorrect: false },
                    { text: 'Allocating objects in a box.', isCorrect: false },
                    { text: 'Testing code in a sandbox.', isCorrect: false }
                ],
                explanation: 'Java automatically converts int to Integer, double to Double, etc., when needed.'
            },
            {
                questionText: 'What does the "static" keyword mean for a variable?',
                options: [
                    { text: 'The variable belongs to the class itself rather than any specific object.', isCorrect: true },
                    { text: 'The variable cannot be changed.', isCorrect: false },
                    { text: 'The variable is stored on the stack.', isCorrect: false },
                    { text: 'The variable is accessible only by the OS.', isCorrect: false }
                ],
                explanation: 'Static variables are shared among all instances of a class.'
            },
            {
                questionText: 'What is a "Constructor"?',
                options: [
                    { text: 'A special method used to initialize objects.', isCorrect: true },
                    { text: 'A method used to destroy an object.', isCorrect: false },
                    { text: 'A loop that builds an array.', isCorrect: false },
                    { text: 'A design tool.', isCorrect: false }
                ],
                explanation: 'Constructors are called when an object is created using the "new" keyword.'
            },
            {
                questionText: 'How do you handle multiple exceptions in one catch block in Java 7+?',
                options: [
                    { text: 'Use pipe: catch(Exp1 | Exp2 e)', isCorrect: true },
                    { text: 'Use comma: catch(Exp1, Exp2 e)', isCorrect: false },
                    { text: 'Use multiple catch keywords.', isCorrect: false },
                    { text: 'It is not possible.', isCorrect: false }
                ],
                explanation: 'The multi-catch feature reduces code duplication when multiple exceptions need the same handling logic.'
            },
            {
                questionText: 'What is "String Immutability"?',
                options: [
                    { text: 'String objects cannot be changed once created.', isCorrect: true },
                    { text: 'Strings cannot be compared.', isCorrect: false },
                    { text: 'Strings are only stored in memory.', isCorrect: false },
                    { text: 'Strings can only have 10 characters.', isCorrect: false }
                ],
                explanation: 'If you "modify" a string, Java actually creates a new string object in the string pool.'
            },
            {
                questionText: 'What is "Polymorphism"?',
                options: [
                    { text: 'The ability of an object to take on many forms (e.g., Parent p = new Child()).', isCorrect: true },
                    { text: 'Having many variables.', isCorrect: false },
                    { text: 'Using multiple inheritance.', isCorrect: false },
                    { text: 'Deleting objects manually.', isCorrect: false }
                ],
                explanation: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass.'
            },
            {
                questionText: 'Which method of the Thread class is used to start execution?',
                options: [
                    { text: 'start()', isCorrect: true },
                    { text: 'run()', isCorrect: false },
                    { text: 'execute()', isCorrect: false },
                    { text: 'begin()', isCorrect: false }
                ],
                explanation: 'start() tells the JVM to allocate a new thread and execute the run() method internally.'
            },
            {
                questionText: 'What is an "Abstract Class"?',
                options: [
                    { text: 'A class that cannot be instantiated.', isCorrect: true },
                    { text: 'A class with no methods.', isCorrect: false },
                    { text: 'A class that is hidden.', isCorrect: false },
                    { text: 'A class used for math only.', isCorrect: false }
                ],
                explanation: 'Abstract classes are designed to be extended by other classes to provide specific implementations.'
            },
            {
                questionText: 'What is the use of "Packages"?',
                options: [
                    { text: 'To group related classes and interfaces and prevent naming conflicts.', isCorrect: true },
                    { text: 'To distribute programs.', isCorrect: false },
                    { text: 'To compress files.', isCorrect: false },
                    { text: 'To track versions.', isCorrect: false }
                ],
                explanation: 'Packages provides a namespace and organizational structure for Java projects.'
            },
            {
                questionText: 'What is "Garbage Collection"?',
                options: [
                    { text: 'Automatic memory management that deletes unused objects.', isCorrect: true },
                    { text: 'Cleaning up the hard drive.', isCorrect: false },
                    { text: 'Deleting old code.', isCorrect: false },
                    { text: 'Emptying the Recycle Bin.', isCorrect: false }
                ],
                explanation: 'The JVM periodically runs a garbage collector to free up heap memory.'
            },
            {
                questionText: 'What is the output of "System.out.println(1 + 2 + \\"3\\");"?',
                options: [
                    { text: '33', isCorrect: true },
                    { text: '6', isCorrect: false },
                    { text: '123', isCorrect: false },
                    { text: 'Error', isCorrect: false }
                ],
                explanation: 'Java evaluates from left to right. 1 + 2 = 3. Then 3 + "3" performs string concatenation resulting in "33".'
            },
            {
                questionText: 'Which keyword is used to make a class inherit from another?',
                options: [
                    { text: 'extends', isCorrect: true },
                    { text: 'inherits', isCorrect: false },
                    { text: 'implements', isCorrect: false },
                    { text: 'is-a', isCorrect: false }
                ],
                explanation: 'The "extends" keyword indicates that a new class is derived from an existing one.'
            },
            {
                questionText: 'What is "Wrapper Class"?',
                options: [
                    { text: 'A class whose object wraps or contains primitive data types.', isCorrect: true },
                    { text: 'A class that surrounds the whole program.', isCorrect: false },
                    { text: 'A class used for encryption.', isCorrect: false },
                    { text: 'A decorative class.', isCorrect: false }
                ],
                explanation: 'Examples include Integer for int, Character for char, etc.'
            },
            {
                questionText: 'What is the default value of a local variable in Java?',
                options: [
                    { text: 'No default value (Must be initialized)', isCorrect: true },
                    { text: '0', isCorrect: false },
                    { text: 'null', isCorrect: false },
                    { text: 'Garbage value', isCorrect: false }
                ],
                explanation: 'Unlike instance variables, local variables must be initialized before use or a compile error occurs.'
            },
            {
                questionText: 'Which loop is known as the "Enhanced For Loop"?',
                options: [
                    { text: 'for-each', isCorrect: true },
                    { text: 'while', isCorrect: false },
                    { text: 'do-while', isCorrect: false },
                    { text: 'iterator', isCorrect: false }
                ],
                explanation: 'The for-each loop simplifies iterating over arrays and collections.'
            },
            {
                questionText: 'What is "Casting" in Java?',
                options: [
                    { text: 'Converting one data type to another.', isCorrect: true },
                    { text: 'Printing to the console.', isCorrect: false },
                    { text: 'Throwing an exception.', isCorrect: false },
                    { text: 'Selecting a font.', isCorrect: false }
                ],
                explanation: 'Casting can be widening (automatic) or narrowing (requires explicit (type)).'
            },
            {
                questionText: 'What is the "main" method signature?',
                options: [
                    { text: 'public static void main(String[] args)', isCorrect: true },
                    { text: 'public void main(String args[])', isCorrect: false },
                    { text: 'private static void main(String args)', isCorrect: false },
                    { text: 'void static public main()', isCorrect: false }
                ],
                explanation: 'The method must be public, static, return void, and accept a String array parameter for the JVM to use it as an entry point.'
            }
        ]
    },
    {
        code: 'CS305',
        name: 'Python',
        questions: [
            {
                questionText: 'How is a block of code defined in Python?',
                options: [
                    { text: 'Using indentation', isCorrect: true },
                    { text: 'Using curly braces {}', isCorrect: false },
                    { text: 'Using parentheses ()', isCorrect: false },
                    { text: 'Using keywords like begin/end', isCorrect: false }
                ],
                explanation: 'Python uses whitespace (indentation) to delimit blocks of code, making it readable and standardized.'
            },
            {
                questionText: 'What is the correct way to create a list in Python?',
                options: [
                    { text: 'my_list = [1, 2, 3]', isCorrect: true },
                    { text: 'my_list = (1, 2, 3)', isCorrect: false },
                    { text: 'my_list = {1, 2, 3}', isCorrect: false },
                    { text: 'my_list = <1, 2, 3>', isCorrect: false }
                ],
                explanation: 'Square brackets [] are used to define lists, which are mutable sequences.'
            },
            {
                questionText: 'What is the difference between a List and a Tuple?',
                options: [
                    { text: 'Lists are mutable, Tuples are immutable.', isCorrect: true },
                    { text: 'Lists are faster.', isCorrect: false },
                    { text: 'Tuples are mutable, Lists are not.', isCorrect: false },
                    { text: 'There is no difference.', isCorrect: false }
                ],
                explanation: 'Once a tuple is created, its elements cannot be changed, whereas lists can be modified.'
            },
            {
                questionText: 'Which function is used to get the length of a sequence in Python?',
                options: [
                    { text: 'len()', isCorrect: true },
                    { text: 'length()', isCorrect: false },
                    { text: 'count()', isCorrect: false },
                    { text: 'size()', isCorrect: false }
                ],
                explanation: 'len() is a built-in function that returns the number of items in an object.'
            },
            {
                questionText: 'What is "List Comprehension"?',
                options: [
                    { text: 'A concise way to create lists using an expression and a loop.', isCorrect: true },
                    { text: 'A way to read lists from a file.', isCorrect: false },
                    { text: 'A method to sort lists.', isCorrect: false },
                    { text: 'A tool for debugging lists.', isCorrect: false }
                ],
                explanation: 'Example: [x**2 for x in range(10)] creates a list of squares.'
            },
            {
                questionText: 'Which operator is used for exponentiation (power) in Python?',
                options: [
                    { text: '**', isCorrect: true },
                    { text: '^', isCorrect: false },
                    { text: 'pow', isCorrect: false },
                    { text: '&&', isCorrect: false }
                ],
                explanation: '2 ** 3 equals 8 in Python.'
            },
            {
                questionText: 'What is a "Dictionary" in Python?',
                options: [
                    { text: 'A collection of key-value pairs.', isCorrect: true },
                    { text: 'A list of words.', isCorrect: false },
                    { text: 'A fast way to search text.', isCorrect: false },
                    { text: 'A type of file.', isCorrect: false }
                ],
                explanation: 'Dictionaries (dict) allow for efficient lookup of values using unique keys.'
            },
            {
                questionText: 'How do you define a function in Python?',
                options: [
                    { text: 'def my_func():', isCorrect: true },
                    { text: 'function my_func():', isCorrect: false },
                    { text: 'void my_func():', isCorrect: false },
                    { text: 'my_func() ->', isCorrect: false }
                ],
                explanation: 'The "def" keyword is used to start a function definition.'
            },
            {
                questionText: 'What is the purpose of "self" in Python class methods?',
                options: [
                    { text: 'It refers to the current instance of the class.', isCorrect: true },
                    { text: 'It is a keyword to declare a variable.', isCorrect: false },
                    { text: 'It is the name of the class.', isCorrect: false },
                    { text: 'It makes the method private.', isCorrect: false }
                ],
                explanation: 'By convention, "self" is the first parameter of any instance method, allowing access to attributes.'
            },
            {
                questionText: 'What does the "range(5)" function produce?',
                options: [
                    { text: '[0, 1, 2, 3, 4]', isCorrect: true },
                    { text: '[1, 2, 3, 4, 5]', isCorrect: false },
                    { text: '[0, 5]', isCorrect: false },
                    { text: 'A random number.', isCorrect: false }
                ],
                explanation: 'range(n) generates numbers from 0 up to (but not including) n.'
            },
            {
                questionText: 'What is "Slicing" in Python sequences?',
                options: [
                    { text: 'Extracting a portion of a sequence using indices like [start:stop].', isCorrect: true },
                    { text: 'Deleting elements from a sequence.', isCorrect: false },
                    { text: 'Dividing a number.', isCorrect: false },
                    { text: 'Filtering a list.', isCorrect: false }
                ],
                explanation: 'my_list[1:3] returns elements at index 1 and 2.'
            },
            {
                questionText: 'Which of these is NOT a valid Python data type?',
                options: [
                    { text: 'char', isCorrect: true },
                    { text: 'int', isCorrect: false },
                    { text: 'float', isCorrect: false },
                    { text: 'bool', isCorrect: false }
                ],
                explanation: 'Python does not have a separate "char" type; single characters are just strings of length 1.'
            },
            {
                questionText: 'What is the output of "bool([])"?',
                options: [
                    { text: 'False', isCorrect: true },
                    { text: 'True', isCorrect: false },
                    { text: 'None', isCorrect: false },
                    { text: 'Error', isCorrect: false }
                ],
                explanation: 'Empty sequences (lists, strings, tuples, sets, dicts) evaluate to False in a boolean context.'
            },
            {
                questionText: 'What is a "Lambda" function?',
                options: [
                    { text: 'A small anonymous function defined with the lambda keyword.', isCorrect: true },
                    { text: 'A function that runs indefinitely.', isCorrect: false },
                    { text: 'A function used for scientific computing.', isCorrect: false },
                    { text: 'A way to import modules.', isCorrect: false }
                ],
                explanation: 'Lambdas are single-expression functions often used as short-lived callbacks.'
            },
            {
                questionText: 'How do you handle exceptions in Python?',
                options: [
                    { text: 'try...except', isCorrect: true },
                    { text: 'try...catch', isCorrect: false },
                    { text: 'do...while', isCorrect: false },
                    { text: 'if...error', isCorrect: false }
                ],
                explanation: 'Python uses try/except blocks for error handling.'
            },
            {
                questionText: 'What is the "with" statement (Context Manager) used for?',
                options: [
                    { text: 'To ensure clean setup and teardown of resources (like closing files).', isCorrect: true },
                    { text: 'To perform loops.', isCorrect: false },
                    { text: 'To include other files.', isCorrect: false },
                    { text: 'To define a class.', isCorrect: false }
                ],
                explanation: 'The "with" statement guarantees that close() is called even if an error occurs.'
            },
            {
                questionText: 'What does "pip" do?',
                options: [
                    { text: 'It is a packet manager used to install Python packages.', isCorrect: true },
                    { text: 'Compiles Python code.', isCorrect: false },
                    { text: 'It tests Python performance.', isCorrect: false },
                    { text: 'It is an IDE for Python.', isCorrect: false }
                ],
                explanation: 'pip (Preferred Installer Program) is the standard tool for managing external libraries.'
            },
            {
                questionText: 'What is "PEP 8"?',
                options: [
                    { text: 'The official style guide for Python code.', isCorrect: true },
                    { text: 'A version of Python.', isCorrect: false },
                    { text: 'A mathematical constant.', isCorrect: false },
                    { text: 'A security protocol.', isCorrect: false }
                ],
                explanation: 'PEP 8 provides conventions for indentation, naming, and commenting to ensure consistency across Python projects.'
            },
            {
                questionText: 'What is the output of "3 * \'Ab\'"?',
                options: [
                    { text: 'AbAbAb', isCorrect: true },
                    { text: 'Ab 3', isCorrect: false },
                    { text: 'Error', isCorrect: false },
                    { text: 'Ab3', isCorrect: false }
                ],
                explanation: 'In Python, multiplying a string by an integer repeats the string.'
            },
            {
                questionText: 'What is a "Set" in Python?',
                options: [
                    { text: 'An unordered collection of unique elements.', isCorrect: true },
                    { text: 'A collection that allows duplicate elements.', isCorrect: false },
                    { text: 'A sorted list.', isCorrect: false },
                    { text: 'A type of function.', isCorrect: false }
                ],
                explanation: 'Sets are useful for membership testing and removing duplicates from sequences.'
            },
            {
                questionText: 'What is "Recursion Limit" in Python?',
                options: [
                    { text: 'The maximum number of times a function can call itself to prevent stack overflow.', isCorrect: true },
                    { text: 'The maximum value of an integer.', isCorrect: false },
                    { text: 'The time limit for a function.', isCorrect: false },
                    { text: 'The number of functions in a file.', isCorrect: false }
                ],
                explanation: 'Python has a default limit (usually 1000) that can be adjusted using the sys module.'
            },
            {
                questionText: 'Which module is used for regular expressions in Python?',
                options: [
                    { text: 're', isCorrect: true },
                    { text: 'regex', isCorrect: false },
                    { text: 'exp', isCorrect: false },
                    { text: 'search', isCorrect: false }
                ],
                explanation: 'The "re" module provides functions like search, match, and sub for string pattern matching.'
            },
            {
                questionText: 'What is a "Generator"?',
                options: [
                    { text: 'A function that yields values one at a time using the "yield" keyword.', isCorrect: true },
                    { text: 'A script that creates Python files.', isCorrect: false },
                    { text: 'A powerful CPU.', isCorrect: false },
                    { text: 'A random number source.', isCorrect: false }
                ],
                explanation: 'Generators are memory-efficient because they produce items on-the-fly instead of storing them in memory.'
            },
            {
                questionText: 'What is an "f-string"?',
                options: [
                    { text: 'A formatted string literal that allows embedding expressions (e.g., f"Hello {name}").', isCorrect: true },
                    { text: 'A string that is forbidden.', isCorrect: false },
                    { text: 'A string used in functions.', isCorrect: false },
                    { text: 'A very fast string.', isCorrect: false }
                ],
                explanation: 'F-strings were introduced in Python 3.6 as a modern way to format strings.'
            },
            {
                questionText: 'How do you check the type of an object in Python?',
                options: [
                    { text: 'type(obj)', isCorrect: true },
                    { text: 'typeof(obj)', isCorrect: false },
                    { text: 'whatis(obj)', isCorrect: false },
                    { text: 'obj.type()', isCorrect: false }
                ],
                explanation: 'The built-in type() function returns the class of the object.'
            },
            {
                questionText: 'What does "is" operator check?',
                options: [
                    { text: 'Identity equality (if two variables point to same object).', isCorrect: true },
                    { text: 'Value equality (like ==)', isCorrect: false },
                    { text: 'If a variable exists.', isCorrect: false },
                    { text: 'If a number is prime.', isCorrect: false }
                ],
                explanation: 'While "==" checks if values are the same, "is" checks if both variables refer to the exact same memory location.'
            },
            {
                questionText: 'What is the purpose of "__init__"?',
                options: [
                    { text: 'The constructor method of a class.', isCorrect: true },
                    { text: 'To delete an object.', isCorrect: false },
                    { text: 'To import a module.', isCorrect: false },
                    { text: 'To start the program.', isCorrect: false }
                ],
                explanation: 'It is automatically called when a new instance of a class is created.'
            },
            {
                questionText: 'What is "Inheritance"?',
                options: [
                    { text: 'A mechanism where a class can derive attributes and methods from another class.', isCorrect: true },
                    { text: 'Copying code manually.', isCorrect: false },
                    { text: 'Deleting files from a computer.', isCorrect: false },
                    { text: 'A way to share data on a network.', isCorrect: false }
                ],
                explanation: 'Inheritance promotes code reuse and hierarchical organization.'
            },
            {
                questionText: 'Which function is used to convert a string to an integer in Python?',
                options: [
                    { text: 'int()', isCorrect: true },
                    { text: 'integer()', isCorrect: false },
                    { text: 'toInt()', isCorrect: false },
                    { text: 'strToInt()', isCorrect: false }
                ],
                explanation: 'int("123") returns the integer 123.'
            },
            {
                questionText: 'What is the output of "10 // 3"?',
                options: [
                    { text: '3', isCorrect: true },
                    { text: '3.33', isCorrect: false },
                    { text: '4', isCorrect: false },
                    { text: '1', isCorrect: false }
                ],
                explanation: '// is the floor division operator, which returns the largest integer less than or equal to the result.'
            }
        ]
    },
    {
        code: 'CS303',
        name: 'Database Management Systems',
        questions: [
            {
                questionText: 'What is the primary purpose of a Database Management System (DBMS)?',
                options: [
                    { text: 'To store and manage large amounts of data efficiently and securely.', isCorrect: true },
                    { text: 'To provide a user interface for web browsing.', isCorrect: false },
                    { text: 'To compile high-level programming languages.', isCorrect: false },
                    { text: 'To manage hardware resources like RAM and CPU.', isCorrect: false }
                ],
                explanation: 'A DBMS is software designed to store, retrieve, and manage data while ensuring its integrity and security.'
            },
            {
                questionText: 'Which level of data abstraction describes HOW the data is actually stored in disk?',
                options: [
                    { text: 'Logical Level', isCorrect: false },
                    { text: 'Physical Level', isCorrect: true },
                    { text: 'View Level', isCorrect: false },
                    { text: 'Conceptual Level', isCorrect: false }
                ],
                explanation: 'The Physical Level is the lowest level of abstraction that describes complex low-level data structures in detail.'
            },
            {
                questionText: 'What is a "Database Schema"?',
                options: [
                    { text: 'The actual data stored at a particular moment.', isCorrect: false },
                    { text: 'The overall design or structure of the database.', isCorrect: true },
                    { text: 'A tool used to query data.', isCorrect: false },
                    { text: 'A user who manages the database.', isCorrect: false }
                ],
                explanation: 'A schema is the skeleton or logical representation of the entire database, similar to a variable definition in a program.'
            },
            {
                questionText: 'Which of the following describes "Logical Data Independence"?',
                options: [
                    { text: 'The ability to change the physical schema without affecting the logical schema.', isCorrect: false },
                    { text: 'The ability to change the logical schema without affecting the external schema or application programs.', isCorrect: true },
                    { text: 'The ability to hide data from users.', isCorrect: false },
                    { text: 'The ability to use different programming languages.', isCorrect: false }
                ],
                explanation: 'Logical data independence allows for modifications to the conceptual design without requiring changes to the user views.'
            },
            {
                questionText: 'In the Relational Model, a row is called a:',
                options: [
                    { text: 'Attribute', isCorrect: false },
                    { text: 'Relation', isCorrect: false },
                    { text: 'Tuple', isCorrect: true },
                    { text: 'Domain', isCorrect: false }
                ],
                explanation: 'A tuple represents a single record or instance of an entity in a table.'
            },
            {
                questionText: 'What is a "Candidate Key" in RDBMS?',
                options: [
                    { text: 'The key selected by the DBA to uniquely identify rows.', isCorrect: false },
                    { text: 'Any set of attributes that can uniquely identify a tuple.', isCorrect: true },
                    { text: 'A key that points to another table.', isCorrect: false },
                    { text: 'A key that is used for encryption.', isCorrect: false }
                ],
                explanation: 'A candidate key is a minimal superkey; there can be multiple candidate keys in a relation.'
            },
            {
                questionText: 'A "Foreign Key" is used to:',
                options: [
                    { text: 'Uniquely identify a record in its own table.', isCorrect: false },
                    { text: 'Establish and enforce a link between data in two tables.', isCorrect: true },
                    { text: 'Encrypt the database.', isCorrect: false },
                    { text: 'Speed up searching.', isCorrect: false }
                ],
                explanation: 'Foreign keys provide referential integrity by ensuring that the value in one table matches a value in another (primary) table.'
            },
            {
                questionText: 'Which SQL category includes commands like CREATE, ALTER, and DROP?',
                options: [
                    { text: 'DML (Data Manipulation Language)', isCorrect: false },
                    { text: 'DCL (Data Control Language)', isCorrect: false },
                    { text: 'DDL (Data Definition Language)', isCorrect: true },
                    { text: 'TCL (Transaction Control Language)', isCorrect: false }
                ],
                explanation: 'DDL is used to define the database structure, such as tables, indexes, and constraints.'
            },
            {
                questionText: 'What is the result of a SELECT operation in Relational Algebra?',
                options: [
                    { text: 'A subset of columns from the original relation.', isCorrect: false },
                    { text: 'A subset of tuples that satisfy a given predicate.', isCorrect: true },
                    { text: 'A combination of two relations.', isCorrect: false },
                    { text: 'A sorted list of attributes.', isCorrect: false }
                ],
                explanation: 'The selection operator (sigma) filters rows based on a specific condition.'
            },
            {
                questionText: 'Which operation is used to combine all pairs of tuples from two relations, regardless of whether they match?',
                options: [
                    { text: 'Intersection', isCorrect: false },
                    { text: 'Natural Join', isCorrect: false },
                    { text: 'Cartesian Product', isCorrect: true },
                    { text: 'Union', isCorrect: false }
                ],
                explanation: 'The Cartesian Product (X) results in a relation containing every possible combination of rows from the two input relations.'
            },
            {
                questionText: 'What does "Natural Join" do?',
                options: [
                    { text: 'Joins two tables on all attributes with the same name.', isCorrect: true },
                    { text: 'Join tables based on a user-defined condition using <> operator.', isCorrect: false },
                    { text: 'Removes all duplicates from a single table.', isCorrect: false },
                    { text: 'Connects to a remote database.', isCorrect: false }
                ],
                explanation: 'Natural join automatically matches common attributes and keeps only one copy of them in the result.'
            },
            {
                questionText: 'In an ER Diagram, what does a "Double Rectangle" represent?',
                options: [
                    { text: 'Strong Entity Set', isCorrect: false },
                    { text: 'Weak Entity Set', isCorrect: true },
                    { text: 'Relationship Set', isCorrect: false },
                    { text: 'Multi-valued Attribute', isCorrect: false }
                ],
                explanation: 'Weak entity sets do not have sufficient attributes to form a primary key and depend on a strong entity.'
            },
            {
                questionText: 'Which attribute type can be divided into smaller sub-parts (e.g., Name into First and Last)?',
                options: [
                    { text: 'Simple Attribute', isCorrect: false },
                    { text: 'Multi-valued Attribute', isCorrect: false },
                    { text: 'Composite Attribute', isCorrect: true },
                    { text: 'Derived Attribute', isCorrect: false }
                ],
                explanation: 'Composite attributes are composed of other atomic attributes.'
            },
            {
                questionText: 'What is "Mapping Cardinality" in a binary relationship?',
                options: [
                    { text: 'The number of attributes in an entity.', isCorrect: false },
                    { text: 'The number of entities to which another entity can be associated via a relationship.', isCorrect: true },
                    { text: 'The size of the database file.', isCorrect: false },
                    { text: 'The number of users in the system.', isCorrect: false }
                ],
                explanation: 'Cardinality ratios (1:1, 1:N, N:M) define the constraints on the number of related entities.'
            },
            {
                questionText: 'A relation is in 1NF if:',
                options: [
                    { text: 'It has no partial dependencies.', isCorrect: false },
                    { text: 'Every attribute contains only atomic (indivisible) values.', isCorrect: true },
                    { text: 'It has at least one primary key.', isCorrect: false },
                    { text: 'It is linked to another table.', isCorrect: false }
                ],
                explanation: 'First Normal Form forbids composite or multi-valued attributes.'
            },
            {
                questionText: 'What is a "Partial Dependency"?',
                options: [
                    { text: 'When a non-key attribute depends on only a part of a composite primary key.', isCorrect: true },
                    { text: 'When an attribute depends on another non-key attribute.', isCorrect: false },
                    { text: 'When a table is missing a foreign key.', isCorrect: false },
                    { text: 'When data is partly corrupted.', isCorrect: false }
                ],
                explanation: 'Partial dependencies are the main issue addressed by Second Normal Form (2NF).'
            },
            {
                questionText: 'A relation is in 3NF if it is in 2NF and has no:',
                options: [
                    { text: 'Primary Keys', isCorrect: false },
                    { text: 'Transitive Dependencies', isCorrect: true },
                    { text: 'Multi-valued attributes', isCorrect: false },
                    { text: 'NULL values', isCorrect: false }
                ],
                explanation: '3NF ensures that non-key attributes depend only on the primary key, not on other non-key attributes.'
            },
            {
                questionText: 'Which normal form is stronger than 3NF and handles anomalous cases where multiple candidate keys overlap?',
                options: [
                    { text: '2NF', isCorrect: false },
                    { text: '4NF', isCorrect: false },
                    { text: 'Boyce-Codd Normal Form (BCNF)', isCorrect: true },
                    { text: '5NF', isCorrect: false }
                ],
                explanation: 'In BCNF, for every functional dependency X -> Y, X must be a superkey.'
            },
            {
                questionText: 'What does the SQL "HAVING" clause do?',
                options: [
                    { text: 'Filters individual rows before grouping.', isCorrect: false },
                    { text: 'Filters groups produced by the GROUP BY clause based on a condition.', isCorrect: true },
                    { text: 'Sorts the final result set.', isCorrect: false },
                    { text: 'Deletes duplicate entries.', isCorrect: false }
                ],
                explanation: 'HAVING is used instead of WHERE for filtering results when aggregate functions (like SUM, COUNT) are involved.'
            },
            {
                questionText: 'What do total participation constraints in an ER model imply?',
                options: [
                    { text: 'Every entity in the set must participate in at least one relationship in the relationship set.', isCorrect: true },
                    { text: 'Only some entities need to participate.', isCorrect: false },
                    { text: 'The entity set has no attributes.', isCorrect: false },
                    { text: 'The relationship is 1:1.', isCorrect: false }
                ],
                explanation: 'Total participation (often shown as a double line) means every instance of that entity must be linked.'
            },
            {
                questionText: 'In ACID properties, what does "Atomicity" mean?',
                options: [
                    { text: 'Data is accessible to all users.', isCorrect: false },
                    { text: 'A transaction must be all-or-nothing; if one part fails, the whole transaction fails.', isCorrect: true },
                    { text: 'Data remains consistent after a crash.', isCorrect: false },
                    { text: 'Multiple transactions can run at once.', isCorrect: false }
                ],
                explanation: 'Atomicity ensures that partial updates to the database are impossible.'
            },
            {
                questionText: 'Which ACID property ensures that the database remains in a valid state after any transaction?',
                options: [
                    { text: 'Atomicity', isCorrect: false },
                    { text: 'Consistency', isCorrect: true },
                    { text: 'Isolation', isCorrect: false },
                    { text: 'Durability', isCorrect: false }
                ],
                explanation: 'Consistency guarantees that transaction effects do not violate any database constraints.'
            },
            {
                questionText: 'What is "Isolation" in ACID properties?',
                options: [
                    { text: 'Transactions are executed sequentially without any overlap.', isCorrect: false },
                    { text: 'Intermediate states of a transaction are invisible to other concurrent transactions.', isCorrect: true },
                    { text: 'The ability to run a database on a separate server.', isCorrect: false },
                    { text: 'Protecting data from hackers.', isCorrect: false }
                ],
                explanation: 'Isolation prevents concurrent transactions from interfering with each other.'
            },
            {
                questionText: 'What is the "Durability" property?',
                options: [
                    { text: 'How long a query takes to execute.', isCorrect: false },
                    { text: 'Once a transaction is committed, its effects are permanent even in case of system failure.', isCorrect: true },
                    { text: 'The ability to store huge files.', isCorrect: false },
                    { text: 'The strength of the server hardware.', isCorrect: false }
                ],
                explanation: 'Durability ensures that committed data is written to non-volatile storage.'
            },
            {
                questionText: 'Which concurrency control protocol prevents deadlocks by assigning timestamps to transactions?',
                options: [
                    { text: 'Wait-Die or Wound-Wait schemes.', isCorrect: true },
                    { text: 'Simple 2-Phase Locking.', isCorrect: false },
                    { text: 'Standard Rigorous Locking.', isCorrect: false },
                    { text: 'Basic Serialization.', isCorrect: false }
                ],
                explanation: 'Timestamp-based protocols use priorities to decide whether a transaction should wait or be rolled back to avoid cycles.'
            },
            {
                questionText: 'What is a "Deadlock"?',
                options: [
                    { text: 'A state where a transaction finishes successfully.', isCorrect: false },
                    { text: 'A situation where two or more transactions are waiting for each other to release locks, creating a cycle.', isCorrect: true },
                    { text: 'When the database runs out of space.', isCorrect: false },
                    { text: 'When the power goes out.', isCorrect: false }
                ],
                explanation: 'Deadlocks require system intervention (abortion of one transaction) to resolve the waiting cycle.'
            },
            {
                questionText: 'What is the purpose of "Indexing" in DBMS?',
                options: [
                    { text: 'To encrypt sensitive data.', isCorrect: false },
                    { text: 'To speed up data retrieval by providing a faster path to find specific records.', isCorrect: true },
                    { text: 'To create backups of the database.', isCorrect: false },
                    { text: 'To count the number of rows.', isCorrect: false }
                ],
                explanation: 'Indexes act like a book index, allowing the DBMS to find data without scanning every row.'
            },
            {
                questionText: 'Which specialized user is responsible for the overall control and maintenance of the database system?',
                options: [
                    { text: 'Database Administrator (DBA)', isCorrect: true },
                    { text: 'Naive User', isCorrect: false },
                    { text: 'Application Programmer', isCorrect: false },
                    { text: 'End User', isCorrect: false }
                ],
                explanation: 'The DBA manages schemas, security, performance tuning, and backup/recovery.'
            },
            {
                questionText: 'How many rules did E.F. Codd originally define to determine if a system is truly relational?',
                options: [
                    { text: '10', isCorrect: false },
                    { text: '12 (often referred to as 13 including Rule 0)', isCorrect: true },
                    { text: '5', isCorrect: false },
                    { text: '20', isCorrect: false }
                ],
                explanation: 'Codd\'s rules define the characteristics of a Relational Database Management System.'
            },
            {
                questionText: 'In SQL, which join returns all rows from the left table and matched rows from the right table?',
                options: [
                    { text: 'INNER JOIN', isCorrect: false },
                    { text: 'LEFT JOIN (Left Outer Join)', isCorrect: true },
                    { text: 'RIGHT JOIN', isCorrect: false },
                    { text: 'FULL JOIN', isCorrect: false }
                ],
                explanation: 'A LEFT JOIN ensures all data from the "left" relation is included, with NULLs for missing "right" matches.'
            }
        ]
    },
    {
        code: 'CS301',
        name: 'Operating Systems',
        questions: [
            {
                questionText: 'What is the primary role of an Operating System as a resource manager?',
                options: [
                    { text: 'To manage hardware and software resources like CPU, memory, and I/O devices.', isCorrect: true },
                    { text: 'To provide a compiler for C programming.', isCorrect: false },
                    { text: 'To serve as a web server for hosting sites.', isCorrect: false },
                    { text: 'To design circuit boards for the computer.', isCorrect: false }
                ],
                explanation: 'The OS manages hardware allocation and provides an interface for application programs.'
            },
            {
                questionText: 'Which mode of operation allows the OS to execute privileged instructions?',
                options: [
                    { text: 'User Mode', isCorrect: false },
                    { text: 'Kernel Mode (System Mode)', isCorrect: true },
                    { text: 'Safe Mode', isCorrect: false },
                    { text: 'Application Mode', isCorrect: false }
                ],
                explanation: 'Kernel mode provides unrestricted access to hardware and is used by the core OS processes.'
            },
            {
                questionText: 'What is a "Process Control Block" (PCB)?',
                options: [
                    { text: 'A hardware component that speeds up the CPU.', isCorrect: false },
                    { text: 'A data structure that contains all information about a specific process.', isCorrect: true },
                    { text: 'A security tool that blocks viruses.', isCorrect: false },
                    { text: 'A type of computer memory.', isCorrect: false }
                ],
                explanation: 'The PCB stores process state, program counter, register values, and memory management information.'
            },
            {
                questionText: 'Which process state represents a process waiting for an I/O event to complete?',
                options: [
                    { text: 'Running', isCorrect: false },
                    { text: 'Ready', isCorrect: false },
                    { text: 'Waiting (Blocked)', isCorrect: true },
                    { text: 'Terminated', isCorrect: false }
                ],
                explanation: 'A blocked/waiting process cannot run until the resource it needs becomes available.'
            },
            {
                questionText: 'What occurs during a "Context Switch"?',
                options: [
                    { text: 'The OS saves the state of the current process and loads the state of the next process.', isCorrect: true },
                    { text: 'The computer restarts automatically.', isCorrect: false },
                    { text: 'User switches from one window to another.', isCorrect: false },
                    { text: 'The CPU frequency is changed.', isCorrect: false }
                ],
                explanation: 'Context switching allows for multitasking by rotating the CPU among multiple processes.'
            },
            {
                questionText: 'The "fork()" system call is used to:',
                options: [
                    { text: 'Terminate a process.', isCorrect: false },
                    { text: 'Create a new child process that is a copy of the parent.', isCorrect: true },
                    { text: 'Execute a different program.', isCorrect: false },
                    { text: 'Synchronize two processes.', isCorrect: false }
                ],
                explanation: 'After a fork(), both parent and child continue execution from the instruction after the call.'
            },
            {
                questionText: 'In CPU scheduling, "Throughput" refers to:',
                options: [
                    { text: 'The time taken to execute a single process.', isCorrect: false },
                    { text: 'The number of processes completed per unit time.', isCorrect: true },
                    { text: 'The time a process spends in the ready queue.', isCorrect: false },
                    { text: 'The speed of the system bus.', isCorrect: false }
                ],
                explanation: 'Higher throughput indicates a more efficient scheduling system.'
            },
            {
                questionText: 'Which scheduling algorithm is non-preemptive and follows the order in which processes arrive?',
                options: [
                    { text: 'First-Come, First-Served (FCFS)', isCorrect: true },
                    { text: 'Round Robin', isCorrect: false },
                    { text: 'Shortest Job First (Preemptive)', isCorrect: false },
                    { text: 'Priority Scheduling', isCorrect: false }
                ],
                explanation: 'FCFS is simple but can suffer from the "Convoy Effect" where small processes wait behind a large one.'
            },
            {
                questionText: 'What is the "Convoy Effect" in FCFS scheduling?',
                options: [
                    { text: 'Many short processes wait behind one long, CPU-bound process.', isCorrect: true },
                    { text: 'Multiple processes crashing at once.', isCorrect: false },
                    { text: 'A process never getting the CPU.', isCorrect: false },
                    { text: 'High memory usage by a single process.', isCorrect: false }
                ],
                explanation: 'This leads to poor CPU and device utilization.'
            },
            {
                questionText: 'Which scheduling algorithm uses a fixed "Time Quantum"?',
                options: [
                    { text: 'Shortest Job First', isCorrect: false },
                    { text: 'Round Robin (RR)', isCorrect: true },
                    { text: 'Priority Scheduling', isCorrect: false },
                    { text: 'Multilevel Queue', isCorrect: false }
                ],
                explanation: 'Round Robin ensures fair CPU time by giving each process a small slice (quantum) of time.'
            },
            {
                questionText: '"Shortest Remaining Time First" is the preemptive version of:',
                options: [
                    { text: 'FCFS', isCorrect: false },
                    { text: 'SJF', isCorrect: true },
                    { text: 'Priority Scheduling', isCorrect: false },
                    { text: 'Round Robin', isCorrect: false }
                ],
                explanation: 'It preempts the current process if a new process with a shorter burst time arrives.'
            },
            {
                questionText: 'What is "Starvation" in Priority Scheduling?',
                options: [
                    { text: 'A low-priority process waits indefinitely for the CPU.', isCorrect: true },
                    { text: 'A process using too much memory.', isCorrect: false },
                    { text: 'The system runs out of power.', isCorrect: false },
                    { text: 'High-priority processes executing too fast.', isCorrect: false }
                ],
                explanation: 'Starvation can be solved through "Aging," which gradually increases the priority of waiting processes.'
            },
            {
                questionText: 'What is a "Race Condition"?',
                options: [
                    { text: 'When two processes try to finish at the same time.', isCorrect: false },
                    { text: 'A situation where the output depends on the specific order of execution of concurrent processes.', isCorrect: true },
                    { text: 'When a process runs faster than the CPU clock.', isCorrect: false },
                    { text: 'Multiple processes competing for internet bandwidth.', isCorrect: false }
                ],
                explanation: 'Race conditions occur when multiple processes access and manipulate shared data concurrently.'
            },
            {
                questionText: 'The "Critical Section" of a program is:',
                options: [
                    { text: 'The part where it handles fatal errors.', isCorrect: false },
                    { text: 'A code segment where shared variables are accessed and updated.', isCorrect: true },
                    { text: 'The main() function.', isCorrect: false },
                    { text: 'The part that requires internet access.', isCorrect: false }
                ],
                explanation: 'Access to the critical section must be mutually exclusive to prevent data inconsistency.'
            },
            {
                questionText: 'What is a "Semaphore"?',
                options: [
                    { text: 'A hardware signal for I/O.', isCorrect: false },
                    { text: 'An integer variable used for signaling and solving synchronization problems.', isCorrect: true },
                    { text: 'A type of encryption key.', isCorrect: false },
                    { text: 'A networking protocol.', isCorrect: false }
                ],
                explanation: 'Semaphores use wait() and signal() operations to manage resource access.'
            },
            {
                questionText: 'Which condition is NOT required for a Deadlock to occur?',
                options: [
                    { text: 'Mutual Exclusion', isCorrect: false },
                    { text: 'Hold and Wait', isCorrect: false },
                    { text: 'Preemption', isCorrect: true },
                    { text: 'Circular Wait', isCorrect: false }
                ],
                explanation: 'Deadlock requires "No Preemption," meaning resources cannot be forcibly taken away.'
            },
            {
                questionText: 'The "Banker’s Algorithm" is used for:',
                options: [
                    { text: 'Sorting banking records.', isCorrect: false },
                    { text: 'Deadlock avoidance in multi-resource systems.', isCorrect: true },
                    { text: 'Encrypting transaction logs.', isCorrect: false },
                    { text: 'Optimizing database queries.', isCorrect: false }
                ],
                explanation: 'It checks if granting a resource request will leave the system in a "safe state."'
            },
            {
                questionText: 'What is a "Logical Address"?',
                options: [
                    { text: 'The actual location in RAM.', isCorrect: false },
                    { text: 'An address generated by the CPU during program execution.', isCorrect: true },
                    { text: 'A physical address on the hard drive.', isCorrect: false },
                    { text: 'An IP address.', isCorrect: false }
                ],
                explanation: 'Logical addresses are mapped to physical addresses by the MMU.'
            },
            {
                questionText: '"External Fragmentation" occurs when:',
                options: [
                    { text: 'Hard drive is full.', isCorrect: false },
                    { text: 'Total memory space exists to satisfy a request, but it is not contiguous.', isCorrect: true },
                    { text: 'Memory is allocated in very large blocks.', isCorrect: false },
                    { text: 'The OS crashes due to memory leak.', isCorrect: false }
                ],
                explanation: 'External fragmentation is a drawback of contiguous memory allocation.'
            },
            {
                questionText: 'What is "Paging"?',
                options: [
                    { text: 'A memory management scheme that eliminates external fragmentation by using non-contiguous allocation.', isCorrect: true },
                    { text: 'A technique for printing documents.', isCorrect: false },
                    { text: 'Dividing the hard drive into sectors.', isCorrect: false },
                    { text: 'Sorting data in a database.', isCorrect: false }
                ],
                explanation: 'Paging divides memory into fixed-size "frames" and processes into "pages."'
            },
            {
                questionText: '"Segmentation" differs from paging because:',
                options: [
                    { text: 'It uses fixed-size blocks.', isCorrect: false },
                    { text: 'It allows for a user-view of memory as a collection of variable-sized segments.', isCorrect: true },
                    { text: 'It is only used in Windows.', isCorrect: false },
                    { text: 'It prevents internal fragmentation entirely.', isCorrect: false }
                ],
                explanation: 'Segments represent logical units like subroutines, stacks, or main functions.'
            },
            {
                questionText: 'What is "Virtual Memory"?',
                options: [
                    { text: 'Physical RAM simulation using software.', isCorrect: false },
                    { text: 'A technique that allows execution of processes that are not completely in memory.', isCorrect: true },
                    { text: 'The memory of a virtual machine.', isCorrect: false },
                    { text: 'Graphics memory.', isCorrect: false }
                ],
                explanation: 'Virtual memory allows programs to be larger than physical RAM.'
            },
            {
                questionText: 'A "Page Fault" occurs when:',
                options: [
                    { text: 'The CPU tries to access a page not currently in RAM.', isCorrect: true },
                    { text: 'The OS runs out of memory.', isCorrect: false },
                    { text: 'The hard drive fails.', isCorrect: false },
                    { text: 'User deletes a file.', isCorrect: false }
                ],
                explanation: 'The OS must then fetch the page from disk into a free frame.'
            },
            {
                questionText: 'Which page replacement algorithm replaces the page that will not be used for the longest period of time?',
                options: [
                    { text: 'FIFO', isCorrect: false },
                    { text: 'LRU (Least Recently Used)', isCorrect: false },
                    { text: 'Optimal Page Replacement', isCorrect: true },
                    { text: 'Second Chance', isCorrect: false }
                ],
                explanation: 'The Optimal algorithm has the lowest possible page-fault rate but is difficult to implement as it requires future knowledge.'
            },
            {
                questionText: '"Thrashing" in an OS happens when:',
                options: [
                    { text: 'A process is deleted.', isCorrect: false },
                    { text: 'The system spends more time paging than executing processes.', isCorrect: true },
                    { text: 'The keyboard stops responding.', isCorrect: false },
                    { text: 'Multiple processes use the same file.', isCorrect: false }
                ],
                explanation: 'Thrashing causes a severe drop in CPU utilization.'
            },
            {
                questionText: 'What is an "inode" in a Unix-like file system?',
                options: [
                    { text: 'A file name.', isCorrect: false },
                    { text: 'A data structure that stores metadata about a file (everything except name and data).', isCorrect: true },
                    { text: 'A type of folder.', isCorrect: false },
                    { text: 'An internet node.', isCorrect: false }
                ],
                explanation: 'Inodes store attributes such as size, permissions, and disk block pointers.'
            },
            {
                questionText: 'Which disk scheduling algorithm services requests that are closest to the current head position first?',
                options: [
                    { text: 'SCAN', isCorrect: false },
                    { text: 'SSTF (Shortest Seek Time First)', isCorrect: true },
                    { text: 'FIFO', isCorrect: false },
                    { text: 'C-SCAN', isCorrect: false }
                ],
                explanation: 'SSTF improves performance but can cause starvation for far-away requests.'
            },
            {
                questionText: 'What is the "C-SCAN" disk scheduling algorithm?',
                options: [
                    { text: 'The head moves in one direction, servicing requests, then immediately returns to the start without servicing.', isCorrect: true },
                    { text: 'Head services requests in both directions.', isCorrect: false },
                    { text: 'Circular Scan of all sectors.', isCorrect: false },
                    { text: 'Scan of only critical files.', isCorrect: false }
                ],
                explanation: 'C-SCAN provides a more uniform wait time than standard SCAN.'
            },
            {
                questionText: 'The "Belady’s Anomaly" is associated with which algorithm?',
                options: [
                    { text: 'LRU', isCorrect: false },
                    { text: 'FIFO Page Replacement', isCorrect: true },
                    { text: 'Banker’s Algorithm', isCorrect: false },
                    { text: 'Round Robin', isCorrect: false }
                ],
                explanation: 'Belady’s Anomaly states that for some page-replacement algorithms, the page-fault rate may increase as the number of frames increases.'
            },
            {
                questionText: 'What is "Spooling"?',
                options: [
                    { text: 'A process of copying data to a buffer so that another device can use it when it is ready.', isCorrect: true },
                    { text: 'Connecting to a pool of servers.', isCorrect: false },
                    { text: 'Deleting obsolete files.', isCorrect: false },
                    { text: 'Speeding up the CPU.', isCorrect: false }
                ],
                explanation: 'Spooling (Simultaneous Peripheral Operations On-Line) is commonly used for print tasks.'
            }
        ]
    }
];

async function seedRefinedQuizzes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        for (const sub of subjects) {
            const course = await Course.findOne({
                $or: [{ code: sub.code }, { name: sub.name }]
            });

            if (!course) {
                console.log(`❌ Course not found for ${sub.name} [${sub.code}]`);
                continue;
            }

            // Remove existing assessments for this course for a clean start with refined quizzes
            await Assessment.deleteMany({ course: course._id });

            const assessment = await Assessment.create({
                title: 'Final Review Quiz',
                description: `A comprehensive final exam for ${course.name} covering major topics from lectures and CSV modules.`,
                course: course._id,
                type: 'final',
                totalMarks: sub.questions.length,
                passingMarks: Math.ceil(sub.questions.length * 0.4),
                duration: 45,
                maxAttempts: 1,
                isPublished: true,
                isActive: true,
                shuffleQuestions: true,
                showScoreImmediately: true,
                createdBy: course.teacher // Use course teacher
            });

            console.log(`📝 Created Assessment for ${course.name} (${assessment._id})`);

            const questionDocs = sub.questions.map((q, idx) => ({
                assessment: assessment._id,
                type: 'mcq',
                questionText: q.questionText,
                options: q.options,
                marks: 1,
                difficulty: idx < 10 ? 'easy' : idx < 20 ? 'medium' : 'hard',
                explanation: q.explanation,
                order: idx + 1
            }));

            await Question.insertMany(questionDocs);
            console.log(`✅ Seeded ${questionDocs.length} refined questions for ${course.name}`);
        }

        console.log('🚀 Refined Quiz Seeding Completed!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding quizzes:', error);
        process.exit(1);
    }
}

seedRefinedQuizzes();
