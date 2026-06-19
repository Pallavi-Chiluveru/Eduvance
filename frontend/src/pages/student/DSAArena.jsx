import { useState, useEffect, useRef, useCallback } from 'react';
import {
    HiOutlineCode, HiOutlineFire, HiOutlineStar, HiOutlineTrendingUp,
    HiOutlineChartBar, HiOutlineLightBulb, HiOutlineCheckCircle,
    HiOutlinePlay, HiOutlineRefresh, HiOutlineChip, HiOutlineSparkles,
    HiOutlineCollection, HiOutlineCalendar, HiOutlineUsers, HiOutlineArrowLeft,
    HiOutlineBadgeCheck, HiOutlineClipboardList, HiOutlineTerminal,
    HiOutlineClock, HiOutlineGlobe, HiOutlineAcademicCap, HiOutlineBookOpen,
    HiCheck, HiOutlineQuestionMarkCircle, HiOutlineX, HiOutlinePencil,
    HiOutlineEye, HiOutlineEyeOff, HiOutlinePaperAirplane,
} from 'react-icons/hi';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MOCK DATA                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

const TOPICS = [
    { id: 'arrays', name: 'Arrays', emoji: '📊', total: 20, easy: 8, medium: 8, hard: 4 },
    { id: 'strings', name: 'Strings', emoji: '🔤', total: 18, easy: 7, medium: 7, hard: 4 },
    { id: 'hashing', name: 'Hashing', emoji: '#️⃣', total: 15, easy: 5, medium: 7, hard: 3 },
    { id: 'two-pointers', name: 'Two Pointers', emoji: '👈👉', total: 12, easy: 4, medium: 6, hard: 2 },
    { id: 'sliding-window', name: 'Sliding Window', emoji: '🪟', total: 12, easy: 4, medium: 5, hard: 3 },
    { id: 'binary-search', name: 'Binary Search', emoji: '🔍', total: 15, easy: 5, medium: 6, hard: 4 },
    { id: 'linked-list', name: 'Linked List', emoji: '🔗', total: 16, easy: 6, medium: 7, hard: 3 },
    { id: 'stack', name: 'Stack', emoji: '📚', total: 14, easy: 5, medium: 6, hard: 3 },
    { id: 'queue', name: 'Queue', emoji: '🎫', total: 10, easy: 4, medium: 4, hard: 2 },
    { id: 'recursion', name: 'Recursion', emoji: '🔁', total: 12, easy: 4, medium: 5, hard: 3 },
    { id: 'trees', name: 'Trees', emoji: '🌳', total: 18, easy: 6, medium: 8, hard: 4 },
    { id: 'bst', name: 'Binary Search Trees', emoji: '🌲', total: 15, easy: 5, medium: 7, hard: 3 },
    { id: 'heap', name: 'Heap', emoji: '⛰️', total: 12, easy: 4, medium: 5, hard: 3 },
    { id: 'graphs', name: 'Graphs', emoji: '🕸️', total: 20, easy: 6, medium: 9, hard: 5 },
    { id: 'greedy', name: 'Greedy', emoji: '🎯', total: 14, easy: 5, medium: 6, hard: 3 },
    { id: 'dp', name: 'Dynamic Programming', emoji: '🧩', total: 22, easy: 6, medium: 10, hard: 6 },
    { id: 'backtracking', name: 'Backtracking', emoji: '↩️', total: 14, easy: 4, medium: 6, hard: 4 },
];

const PROBLEMS = {
    arrays: [
        { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topicId: 'arrays', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }], constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', '-10⁹ ≤ target ≤ 10⁹', 'Only one valid answer exists.'], hints: ['Think about using a HashMap to store previously seen values.', 'For each element, check if (target - element) exists in your map.'], aiHints: ['💡 Hint 1: Think about using a HashMap to store previously visited elements.', '💡 Hint 2: For each num, check if (target - num) already exists in the map. If yes, you found your pair!'], aiExplain: { time: 'O(n)', space: 'O(n)', suggestion: 'Use a single-pass HashMap approach. Store each number with its index. For each new element, check if (target - element) is already in the map before inserting.' }, aiInterview: ['What if the input array is sorted — can you do better than O(n) space?', 'What if there are multiple valid pairs — how would you return all of them?', 'How would you handle duplicate elements in the array?'] },
        { id: 'best-time-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topicId: 'arrays', description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.', examples: [{ input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1), sell on day 5 (price=6), profit = 6-1 = 5.' }], constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'], hints: ['Track the minimum price seen so far.', 'At each step, compute profit = current_price - min_price.'], aiHints: ['💡 Hint 1: Keep track of the minimum price seen so far as you scan left to right.', '💡 Hint 2: At each index, compute current profit = prices[i] - minPrice, and update the maximum profit.'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'Use a single pass with two variables: minPrice and maxProfit. No need for nested loops.' }, aiInterview: ['What if you could make at most 2 transactions?', 'How would you handle the case where prices always decrease?', 'Can you solve this with dynamic programming?'] },
        { id: 'three-sum', title: '3Sum', difficulty: 'Medium', topicId: 'arrays', description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.', examples: [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }], constraints: ['3 ≤ nums.length ≤ 3000', '-10⁵ ≤ nums[i] ≤ 10⁵'], hints: ['Sort the array first.', 'Use two-pointer technique for the inner loop.'], aiHints: ['💡 Hint 1: Sort the array. This helps you use two pointers and avoid duplicates.', '💡 Hint 2: Fix one element, then use two pointers (left, right) to find pairs that sum to -nums[i].'], aiExplain: { time: 'O(n²)', space: 'O(1)', suggestion: 'Sort first, then fix one element and use two-pointer for the rest. Skip duplicates carefully.' }, aiInterview: ['What is the time complexity and why?', 'How do you avoid duplicate triplets?', 'Could you solve 4Sum using the same approach?'] },
        { id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', topicId: 'arrays', description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.', examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merged to [1,6].' }], constraints: ['1 ≤ intervals.length ≤ 10⁴', 'intervals[i].length == 2', '0 ≤ starti ≤ endi ≤ 10⁴'], hints: ['Sort intervals by start time.', 'Compare the end of the last merged interval with start of current.'], aiHints: ['💡 Hint 1: Sort intervals by their start time.', '💡 Hint 2: Iterate and check if the current interval overlaps with the last in result list. If it does, merge by updating the end.'], aiExplain: { time: 'O(n log n)', space: 'O(n)', suggestion: 'Sorting is the key. After sorting, a single pass with comparison is O(n).' }, aiInterview: ['What if intervals are already sorted?', 'How would you find the gap between intervals?', 'What is the difference between overlapping and touching intervals?'] },
        { id: 'trapping-rain', title: 'Trapping Rain Water', difficulty: 'Hard', topicId: 'arrays', description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }], constraints: ['n == height.length', '1 ≤ n ≤ 2 × 10⁴', '0 ≤ height[i] ≤ 10⁵'], hints: ['Water trapped at each position = min(maxLeft, maxRight) - height[i].', 'Two-pointer approach avoids using extra space.'], aiHints: ['💡 Hint 1: For each bar, water it can hold = min(max height to left, max height to right) - its own height.', '💡 Hint 2: Use two pointers from both ends. Process the side with smaller max height first.'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'Two-pointer approach: maintain left_max and right_max. Move the pointer with smaller max. This avoids the O(n) extra space of precomputed arrays.' }, aiInterview: ['What if heights can be floats?', 'How does the two-pointer approach work here? Why is it correct?', 'Can this be solved using a stack? What would the complexity be?'] },
    ],
    strings: [
        { id: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy', topicId: 'strings', description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.', examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true' }, { input: 's = "rat", t = "car"', output: 'false' }], constraints: ['1 ≤ s.length, t.length ≤ 5 × 10⁴', 's and t consist of lowercase English letters.'], hints: ['Count character frequencies.', 'A frequency array of size 26 works perfectly.'], aiHints: ['💡 Hint 1: Count the frequency of each character in both strings.', '💡 Hint 2: If frequencies match for all characters, they are anagrams.'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'Use a single 26-element array. Increment for s, decrement for t. Check if all zeros at end.' }, aiInterview: ['What if the input contains Unicode characters?', 'Can you solve this without extra space?', 'What if you need to find all anagrams of s in t?'] },
        { id: 'longest-palindrome', title: 'Longest Palindromic Substring', difficulty: 'Medium', topicId: 'strings', description: 'Given a string s, return the longest palindromic substring in s.', examples: [{ input: 's = "babad"', output: '"bab"' }, { input: 's = "cbbd"', output: '"bb"' }], constraints: ['1 ≤ s.length ≤ 1000', 's consist of only digits and English letters.'], hints: ['Expand around center for each character.', 'Check both odd and even length palindromes.'], aiHints: ['💡 Hint 1: For each character (and between each pair), try expanding outward as long as characters match.', '💡 Hint 2: Handle both odd-length (center = single char) and even-length (center = pair) palindromes.'], aiExplain: { time: 'O(n²)', space: 'O(1)', suggestion: 'Expand around center approach. For each of 2n-1 centers, expand and track the longest palindrome found.' }, aiInterview: ['Can you solve this in O(n) time? (Manacher\'s algorithm)', 'How would you count the total number of palindromic substrings?', 'What about finding the shortest palindrome by adding characters?'] },
        { id: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium', topicId: 'strings', description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.', examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }], constraints: ['1 ≤ strs.length ≤ 10⁴', '0 ≤ strs[i].length ≤ 100', 'strs[i] consists of lowercase English letters.'], hints: ['Sort each string to get a canonical key.', 'Use a HashMap with sorted string as key.'], aiHints: ['💡 Hint 1: Two strings are anagrams if their sorted versions are equal.', '💡 Hint 2: Use a map where the key is the sorted string and value is the list of original strings.'], aiExplain: { time: 'O(n·k log k)', space: 'O(nk)', suggestion: 'Sort each string as the key. This is simple and efficient. Alternative: use character frequency tuple as key for O(nk) time.' }, aiInterview: ['What is the time complexity of sorting-based vs frequency-count-based approach?', 'How would you handle case-insensitive grouping?', 'Can you group by anagram distance instead?'] },
    ],
    'binary-search': [
        { id: 'binary-search-classic', title: 'Binary Search', difficulty: 'Easy', topicId: 'binary-search', description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.', examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }], constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁴ < nums[i], target < 10⁴', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'], hints: ['Use left and right pointers.', 'Mid = left + (right - left) / 2 avoids overflow.'], aiHints: ['💡 Hint 1: Maintain two pointers: left = 0, right = n-1. Compute mid each iteration.', '💡 Hint 2: If nums[mid] == target, return mid. If nums[mid] < target, search right half. Else, search left half.'], aiExplain: { time: 'O(log n)', space: 'O(1)', suggestion: 'Classic iterative binary search. Use mid = left + (right - left) / 2 to avoid integer overflow.' }, aiInterview: ['What is the difference between floor and ceiling division for mid?', 'How would you find the first and last occurrence of a target?', 'What if the array has duplicates?'] },
        { id: 'search-rotated', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topicId: 'binary-search', description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.', examples: [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' }], constraints: ['1 ≤ nums.length ≤ 5000', '-10⁴ ≤ nums[i] ≤ 10⁴', 'All values of nums are unique.'], hints: ['At least one half of the array is always sorted.', 'Determine which half is sorted, then decide which half to search.'], aiHints: ['💡 Hint 1: At any mid point, at least one side (left or right) is always sorted.', '💡 Hint 2: If left side is sorted and target is in [left, mid] range, go left. Otherwise go right. Mirror logic for right side.'], aiExplain: { time: 'O(log n)', space: 'O(1)', suggestion: 'Modified binary search. Check which half is sorted, then determine if target lies in the sorted half.' }, aiInterview: ['What if the array has duplicates?', 'How would you find the rotation pivot?', 'What if you need to find the minimum element in the rotated array?'] },
    ],
    'linked-list': [
        { id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', topicId: 'linked-list', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }], constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 ≤ Node.val ≤ 5000.'], hints: ['Use three pointers: prev, curr, next.', 'Iterative approach is O(n) time, O(1) space.'], aiHints: ['💡 Hint 1: Use three pointers: prev (initially null), curr (initially head), next.', '💡 Hint 2: At each step: save next = curr.next, set curr.next = prev, advance prev = curr, curr = next.'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'Iterative three-pointer approach. Can also do recursively but that uses O(n) stack space.' }, aiInterview: ['How would you reverse only a portion of the linked list?', 'What is the recursive approach and its space complexity?', 'How would you detect if a linked list has a cycle?'] },
        { id: 'merge-two-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topicId: 'linked-list', description: 'You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.', examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }], constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 ≤ Node.val ≤ 100.', 'Both list1 and list2 are sorted in non-decreasing order.'], hints: ['Use a dummy node to simplify edge cases.', 'Compare heads of both lists and advance accordingly.'], aiHints: ['💡 Hint 1: Create a dummy head node to simplify the merge logic.', '💡 Hint 2: Use a pointer to build the result. At each step, compare the heads of both lists and attach the smaller one.'], aiExplain: { time: 'O(n+m)', space: 'O(1)', suggestion: 'Iterative with a dummy head is clean and efficient. Recursive solution is elegant but uses O(n+m) stack space.' }, aiInterview: ['How would you merge k sorted linked lists?', 'What if the lists are doubly linked?', 'Can you do this in-place without creating new nodes?'] },
    ],
    trees: [
        { id: 'max-depth-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topicId: 'trees', description: 'Given the root of a binary tree, return its maximum depth.\n\nA binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.', examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3' }], constraints: ['The number of nodes in the tree is in the range [0, 10⁴].', '-100 ≤ Node.val ≤ 100.'], hints: ['Recursion is natural here.', 'maxDepth = 1 + max(left, right).'], aiHints: ['💡 Hint 1: Think recursively. The depth of a tree = 1 + max(depth of left subtree, depth of right subtree).', '💡 Hint 2: Base case: if root is null, return 0.'], aiExplain: { time: 'O(n)', space: 'O(h) where h is height', suggestion: 'Recursive DFS is clean. BFS level-order traversal also works and avoids recursion stack depth issues for very deep trees.' }, aiInterview: ['How would you find the minimum depth instead?', 'How does the BFS approach differ?', 'What if you need to return all root-to-leaf paths?'] },
        { id: 'invert-tree', title: 'Invert Binary Tree', difficulty: 'Easy', topicId: 'trees', description: 'Given the root of a binary tree, invert the tree, and return its root.', examples: [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }], constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 ≤ Node.val ≤ 100.'], hints: ['Swap left and right children at each node.', 'Recurse on the swapped children.'], aiHints: ['💡 Hint 1: For each node, swap its left and right children.', '💡 Hint 2: Then recursively invert the left and right subtrees. The order doesn\'t matter here.'], aiExplain: { time: 'O(n)', space: 'O(h)', suggestion: 'Recursive approach is cleaner. Iterative with BFS/DFS queue also works.' }, aiInterview: ['What is the difference between pre-order and post-order inversion?', 'How would you check if two trees are mirror images?', 'What traversal order does this use?'] },
        { id: 'lca-bst', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', topicId: 'trees', description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.', examples: [{ input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6' }], constraints: ['The number of nodes in the tree is in the range [2, 10⁵].', '-10⁹ ≤ Node.val ≤ 10⁹.', 'All Node.val are unique.'], hints: ['Use BST property: left < root < right.', 'If both nodes are smaller, go left. If both larger, go right. Otherwise current is LCA.'], aiHints: ['💡 Hint 1: Use the BST property. If p.val and q.val are both less than root.val, LCA is in left subtree.', '💡 Hint 2: If both are greater, LCA is in right subtree. Otherwise, current node IS the LCA.'], aiExplain: { time: 'O(h)', space: 'O(1)', suggestion: 'BST property makes this elegant O(h). For general binary tree, you need O(n) DFS approach.' }, aiInterview: ['How does this change for a general binary tree (not a BST)?', 'What if one node doesn\'t exist in the tree?', 'How would you find LCA for multiple nodes?'] },
    ],
    dp: [
        { id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topicId: 'dp', description: 'You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', examples: [{ input: 'n = 2', output: '2', explanation: '1 + 1 or 2.' }, { input: 'n = 3', output: '3' }], constraints: ['1 ≤ n ≤ 45'], hints: ['Think about which steps can lead to step n.', 'This is essentially Fibonacci.'], aiHints: ['💡 Hint 1: To reach step n, you came from step n-1 (1 step) or step n-2 (2 steps).', '💡 Hint 2: So ways(n) = ways(n-1) + ways(n-2). This is the Fibonacci sequence!'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'Optimize from O(n) space DP to O(1) by only tracking the last two values (like Fibonacci).' }, aiInterview: ['What if you can climb 1, 2, or 3 steps?', 'How does memoization differ from tabulation here?', 'What is the mathematical closed-form solution?'] },
        { id: 'coin-change', title: 'Coin Change', difficulty: 'Medium', topicId: 'dp', description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.', examples: [{ input: 'coins = [1,5,11], amount = 11', output: '3', explanation: '11 = 1 + 5 + 5' }], constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2³¹ - 1', '0 ≤ amount ≤ 10⁴'], hints: ['Define dp[i] as minimum coins to make amount i.', 'For each coin, check if using it reduces coins needed.'], aiHints: ['💡 Hint 1: Define dp[i] = minimum coins to make amount i. Initialize dp[0] = 0, rest = Infinity.', '💡 Hint 2: For each amount from 1 to target, try each coin. dp[i] = min(dp[i], dp[i - coin] + 1) if i >= coin.'], aiExplain: { time: 'O(amount × coins)', space: 'O(amount)', suggestion: 'Bottom-up DP is clean. This is an unbounded knapsack variant where you can reuse coins.' }, aiInterview: ['How does this differ from the 0/1 knapsack?', 'What if you also need to return the actual coins used?', 'What is the greedy approach and why does it fail for some inputs?'] },
        { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', topicId: 'dp', description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.', examples: [{ input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The longest common subsequence is "ace" which has length 3.' }], constraints: ['1 ≤ text1.length, text2.length ≤ 1000', 'text1 and text2 consist of only lowercase English letters.'], hints: ['Create a 2D DP table.', 'If characters match, dp[i][j] = dp[i-1][j-1] + 1.'], aiHints: ['💡 Hint 1: Build a 2D DP table where dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].', '💡 Hint 2: If text1[i-1] == text2[j-1], dp[i][j] = dp[i-1][j-1] + 1. Else, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).'], aiExplain: { time: 'O(m×n)', space: 'O(m×n)', suggestion: 'Space can be optimized to O(min(m,n)) by only keeping two rows at a time.' }, aiInterview: ['How is LCS related to Edit Distance?', 'Can you reconstruct the actual subsequence (not just its length)?', 'What if you need the longest common substring (contiguous)?'] },
    ],
    graphs: [
        { id: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', topicId: 'graphs', description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.', examples: [{ input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1' }], constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300', 'grid[i][j] is \'0\' or \'1\'.'], hints: ['Use DFS or BFS from each unvisited land cell.', 'Mark visited cells to avoid counting them again.'], aiHints: ['💡 Hint 1: Iterate over every cell. When you find a \'1\', increment count and start DFS/BFS.', '💡 Hint 2: DFS should mark all connected \'1\'s as visited (e.g., change to \'0\') so they aren\'t counted again.'], aiExplain: { time: 'O(m×n)', space: 'O(m×n)', suggestion: 'DFS is simple and clean. BFS with a queue also works. Union-Find is an alternative for dynamic connectivity.' }, aiInterview: ['What if the grid wraps around (toroidal topology)?', 'How would you count the size of the largest island?', 'How does Union-Find approach differ from DFS here?'] },
    ],
};

// Fill in missing topics with generic problems
const ALL_PROBLEM_IDS = [];
TOPICS.forEach(t => {
    if (!PROBLEMS[t.id]) {
        PROBLEMS[t.id] = [
            { id: `${t.id}-easy-1`, title: `${t.name} Basics`, difficulty: 'Easy', topicId: t.id, description: `Practice fundamental ${t.name} concepts and operations.`, examples: [{ input: 'nums = [1,2,3]', output: '6' }], constraints: ['1 ≤ nums.length ≤ 100'], hints: ['Think step by step.', 'Consider edge cases.'], aiHints: ['💡 Hint 1: Start with brute force, then optimize.', '💡 Hint 2: Look for patterns in the input.'], aiExplain: { time: 'O(n)', space: 'O(1)', suggestion: 'There is often an optimized approach using the problem structure.' }, aiInterview: ['What is the time complexity?', 'Can you reduce space usage?', 'How would you handle very large inputs?'] },
            { id: `${t.id}-medium-1`, title: `${t.name} Challenge`, difficulty: 'Medium', topicId: t.id, description: `An intermediate ${t.name} problem requiring careful analysis.`, examples: [{ input: 'Input varies', output: 'Expected output' }], constraints: ['Constraints apply.'], hints: ['Break the problem into sub-problems.', 'Use appropriate data structures.'], aiHints: ['💡 Hint 1: Consider the problem constraints carefully.', '💡 Hint 2: Think about which data structure would help here.'], aiExplain: { time: 'O(n log n)', space: 'O(n)', suggestion: 'Look for a more efficient algorithm based on the problem structure.' }, aiInterview: ['Explain your approach.', 'What are the edge cases?', 'How would you test your solution?'] },
            { id: `${t.id}-hard-1`, title: `Advanced ${t.name}`, difficulty: 'Hard', topicId: t.id, description: `A challenging ${t.name} problem that tests deep understanding.`, examples: [{ input: 'Complex input', output: 'Optimal output' }], constraints: ['Tight constraints.'], hints: ['Think about the optimal substructure.', 'Consider all edge cases.'], aiHints: ['💡 Hint 1: This problem requires combining multiple techniques.', '💡 Hint 2: Start with a brute force O(n²) or O(n³) approach, then optimize.'], aiExplain: { time: 'O(n log n)', space: 'O(n)', suggestion: 'Advanced techniques like segment trees or monotonic stacks may be applicable.' }, aiInterview: ['Walk me through your thought process.', 'What alternative approaches did you consider?', 'How would you handle follow-up constraints?'] },
        ];
    }
    PROBLEMS[t.id].forEach(p => ALL_PROBLEM_IDS.push(p.id));
});

const CODE_TEMPLATES = {
    'Two Sum': {
        Python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
        Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
        'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.count(complement)) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
        JavaScript: `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
    },
};

const getDefaultCode = (problem, lang) => {
    if (CODE_TEMPLATES[problem?.title]?.[lang]) return CODE_TEMPLATES[problem.title][lang];
    const templates = {
        Python: `def solution():\n    # Write your solution here\n    pass\n`,
        Java: `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}`,
        'C++': `class Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};`,
        JavaScript: `var solution = function() {\n    // Write your solution here\n};`,
    };
    return templates[lang] || templates.Python;
};

const BADGES = [
    { id: 'array-master', name: 'Array Master', emoji: '📊', color: '#6366f1', req: 'Solve 10 Array problems', reqCount: 10, topic: 'arrays' },
    { id: 'string-specialist', name: 'String Specialist', emoji: '🔤', color: '#06b6d4', req: 'Solve 8 String problems', reqCount: 8, topic: 'strings' },
    { id: 'hashing-hero', name: 'Hashing Hero', emoji: '#️⃣', color: '#f59e0b', req: 'Solve 5 Hashing problems', reqCount: 5, topic: 'hashing' },
    { id: 'bs-expert', name: 'Binary Search Expert', emoji: '🔍', color: '#10b981', req: 'Solve 8 Binary Search problems', reqCount: 8, topic: 'binary-search' },
    { id: 'll-ninja', name: 'Linked List Ninja', emoji: '🔗', color: '#ef4444', req: 'Solve 8 Linked List problems', reqCount: 8, topic: 'linked-list' },
    { id: 'tree-explorer', name: 'Tree Explorer', emoji: '🌳', color: '#22c55e', req: 'Solve 10 Tree problems', reqCount: 10, topic: 'trees' },
    { id: 'graph-explorer', name: 'Graph Explorer', emoji: '🕸️', color: '#8b5cf6', req: 'Solve 10 Graph problems', reqCount: 10, topic: 'graphs' },
    { id: 'heap-champion', name: 'Heap Champion', emoji: '⛰️', color: '#f97316', req: 'Solve 6 Heap problems', reqCount: 6, topic: 'heap' },
    { id: 'greedy-strategist', name: 'Greedy Strategist', emoji: '🎯', color: '#0ea5e9', req: 'Solve 8 Greedy problems', reqCount: 8, topic: 'greedy' },
    { id: 'dp-warrior', name: 'DP Warrior', emoji: '🧩', color: '#d946ef', req: 'Solve 10 DP problems', reqCount: 10, topic: 'dp' },
    { id: 'backtracking-genius', name: 'Backtracking Genius', emoji: '↩️', color: '#64748b', req: 'Solve 8 Backtracking problems', reqCount: 8, topic: 'backtracking' },
    { id: '50-solved', name: '50 Problems Solved', emoji: '🎖️', color: '#f59e0b', req: 'Solve 50 total problems', reqCount: 50, topic: null },
    { id: '100-solved', name: '100 Problems Solved', emoji: '💯', color: '#6366f1', req: 'Solve 100 total problems', reqCount: 100, topic: null },
    { id: '30-streak', name: '30 Day Streak', emoji: '🔥', color: '#ef4444', req: '30-day coding streak', reqCount: 30, topic: null },
    { id: 'contest-champion', name: 'Contest Champion', emoji: '🏆', color: '#f59e0b', req: 'Win a weekly contest', reqCount: 1, topic: null },
    { id: 'interview-ready', name: 'Interview Ready', emoji: '💼', color: '#10b981', req: 'Complete 5 placement sheets', reqCount: 5, topic: null },
    { id: 'top10', name: 'Top 10 Leaderboard', emoji: '🌟', color: '#eab308', req: 'Reach top 10 in leaderboard', reqCount: 1, topic: null },
];

const COMPANIES = [
    { id: 'amazon', name: 'Amazon', emoji: '📦', color: '#f97316', total: 50 },
    { id: 'google', name: 'Google', emoji: '🔵', color: '#4285f4', total: 60 },
    { id: 'microsoft', name: 'Microsoft', emoji: '🪟', color: '#00a4ef', total: 55 },
    { id: 'adobe', name: 'Adobe', emoji: '🎨', color: '#ef3b2c', total: 40 },
    { id: 'goldman', name: 'Goldman Sachs', emoji: '💰', color: '#6b7280', total: 45 },
    { id: 'tcs', name: 'TCS', emoji: '🏢', color: '#1d4ed8', total: 35 },
    { id: 'infosys', name: 'Infosys', emoji: '💡', color: '#7c3aed', total: 35 },
    { id: 'accenture', name: 'Accenture', emoji: '⚡', color: '#a21caf', total: 30 },
    { id: 'wipro', name: 'Wipro', emoji: '🌐', color: '#15803d', total: 30 },
];

const CONTEST_LEADERBOARD = [
    { rank: 1, name: 'Arjun Sharma', solved: 5, penalty: 120, score: 2880 },
    { rank: 2, name: 'Priya Patel', solved: 5, penalty: 145, score: 2855 },
    { rank: 3, name: 'Rahul Gupta', solved: 4, penalty: 90, score: 1910 },
    { rank: 4, name: 'Sneha Iyer', solved: 4, penalty: 105, score: 1895 },
    { rank: 5, name: 'Dev Mehta', solved: 4, penalty: 130, score: 1870 },
    { rank: 6, name: 'Kavya Nair', solved: 3, penalty: 75, score: 1125 },
    { rank: 7, name: 'Vikram Singh', solved: 3, penalty: 88, score: 1112 },
    { rank: 8, name: 'Ananya Roy', solved: 3, penalty: 95, score: 1105 },
    { rank: 9, name: 'Rohan Joshi', solved: 2, penalty: 60, score: 740 },
    { rank: 10, name: 'Meera Krishnan', solved: 2, penalty: 72, score: 728 },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HEATMAP COMPONENT                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
function ActivityHeatmap({ solvedDates }) {
    const weeks = 26;
    const today = new Date();
    const cells = [];

    for (let w = weeks - 1; w >= 0; w--) {
        const week = [];
        for (let d = 6; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + d));
            const dateStr = date.toISOString().split('T')[0];
            const count = solvedDates[dateStr] || 0;
            week.push({ date: dateStr, count, day: date.getDay() });
        }
        cells.push(week);
    }

    const getColor = (count) => {
        if (count === 0) return 'var(--border-color)';
        if (count === 1) return '#166534';
        if (count === 2) return '#15803d';
        if (count === 3) return '#16a34a';
        return '#22c55e';
    };

    const months = [];
    const seen = new Set();
    cells.forEach((week, wi) => {
        const m = new Date(week[0].date).toLocaleString('default', { month: 'short' });
        if (!seen.has(m)) { seen.add(m); months.push({ label: m, week: wi }); }
    });

    return (
        <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-start', minWidth: 'fit-content' }}>
                {/* Day labels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '20px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <div key={d} style={{ height: '12px', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '12px', width: '24px', textAlign: 'right', paddingRight: '4px' }}>
                            {i % 2 === 0 ? d.slice(0, 1) : ''}
                        </div>
                    ))}
                </div>
                <div>
                    {/* Month labels */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', height: '16px' }}>
                        {cells.map((_, wi) => {
                            const m = months.find(mo => mo.week === wi);
                            return (
                                <div key={wi} style={{ width: '12px', fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {m ? m.label : ''}
                                </div>
                            );
                        })}
                    </div>
                    {/* Grid */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {cells.map((week, wi) => (
                            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {week.reverse().map((cell) => (
                                    <div
                                        key={cell.date}
                                        title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                                        style={{
                                            width: '12px', height: '12px', borderRadius: '2px',
                                            background: getColor(cell.count),
                                            cursor: 'default',
                                            transition: 'transform 0.1s',
                                        }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.4)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Less</span>
                {[0, 1, 2, 3, 4].map(v => (
                    <div key={v} style={{ width: '10px', height: '10px', borderRadius: '2px', background: v === 0 ? 'var(--border-color)' : v === 1 ? '#166534' : v === 2 ? '#15803d' : v === 3 ? '#16a34a' : '#22c55e' }} />
                ))}
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>More</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CIRCULAR PROGRESS RING                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function CircularProgress({ solved, total, size = 120, strokeWidth = 10 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(solved / total, 1);
    const offset = circumference - pct * circumference;
    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="url(#progressGrad)" strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>{solved}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>/ {total}</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DIFFICULTY BADGE                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
function DiffBadge({ difficulty }) {
    const map = { Easy: { bg: '#dcfce7', text: '#15803d' }, Medium: { bg: '#fef9c3', text: '#a16207' }, Hard: { bg: '#fee2e2', text: '#dc2626' } };
    const s = map[difficulty] || map.Easy;
    return (
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '99px', background: s.bg, color: s.text }}>
            {difficulty}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN DSA ARENA COMPONENT                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function DSAArena() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [diffFilter, setDiffFilter] = useState('All');
    const [language, setLanguage] = useState('Python');
    const [code, setCode] = useState('');
    const [aiPanel, setAiPanel] = useState(null); // 'hint' | 'explain' | 'interview'
    const [hintIndex, setHintIndex] = useState(0);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [expandedCompany, setExpandedCompany] = useState(null);
    const [showBadgeToast, setShowBadgeToast] = useState(null);
    const [activeContestTab, setActiveContestTab] = useState('upcoming');

    // Fake heatmap data
    const solvedDates = {};
    const today = new Date();
    [3, 5, 7, 12, 14, 18, 21, 24, 25, 26, 30, 33, 35, 40, 41, 42, 45, 50, 55, 60].forEach(d => {
        const dt = new Date(today); dt.setDate(today.getDate() - d);
        solvedDates[dt.toISOString().split('T')[0]] = Math.floor(Math.random() * 4) + 1;
    });

    useEffect(() => {
        if (selectedProblem) {
            setCode(getDefaultCode(selectedProblem, language));
            setAiPanel(null);
            setHintIndex(0);
            setRunResult(null);
            setSubmitResult(null);
        }
    }, [selectedProblem, language]);

    const openTopic = (topic) => { setSelectedTopic(topic); setActiveTab('problems'); setDiffFilter('All'); };
    const openProblem = (problem) => { setSelectedProblem(problem); setActiveTab('workspace'); };

    const handleSubmit = () => {
        const pass = code.length > 30;
        setSubmitResult(pass ? 'accepted' : 'wrong');
        if (pass && !solvedProblems.has(selectedProblem.id)) {
            const newSolved = new Set(solvedProblems);
            newSolved.add(selectedProblem.id);
            setSolvedProblems(newSolved);
            const xpGain = selectedProblem.difficulty === 'Easy' ? 5 : selectedProblem.difficulty === 'Medium' ? 15 : 30;
            setXp(prev => prev + xpGain);
            setShowBadgeToast(`+${xpGain} XP earned! 🎉`);
            setTimeout(() => setShowBadgeToast(null), 3000);
        }
    };

    const handleRun = () => {
        setRunResult(code.length > 20 ? 'pass' : 'fail');
        setTimeout(() => setRunResult(null), 3000);
    };

    const totalSolved = solvedProblems.size;
    const easySolved = [...solvedProblems].filter(id => {
        for (const ps of Object.values(PROBLEMS)) {
            const p = ps.find(x => x.id === id);
            if (p && p.difficulty === 'Easy') return true;
        }
        return false;
    }).length;
    const mediumSolved = [...solvedProblems].filter(id => {
        for (const ps of Object.values(PROBLEMS)) {
            const p = ps.find(x => x.id === id);
            if (p && p.difficulty === 'Medium') return true;
        }
        return false;
    }).length;
    const hardSolved = totalSolved - easySolved - mediumSolved;

    const TABS = [
        { id: 'home', label: 'Home', icon: HiOutlineHome2 },
        { id: 'topics', label: 'Topics', icon: HiOutlineCollection },
        { id: 'problems', label: 'Problem Bank', icon: HiOutlineClipboardList },
        { id: 'workspace', label: 'Workspace', icon: HiOutlineTerminal },
        { id: 'contests', label: 'Weekly Contests', icon: HiOutlineCalendar },
        { id: 'placement', label: 'Placement Sheets', icon: HiOutlineAcademicCap },
        { id: 'analytics', label: 'Analytics', icon: HiOutlineChartBar },
    ];

    const nextSunday = () => {
        const d = new Date(); const day = d.getDay();
        const diff = day === 0 ? 7 : 7 - day;
        d.setDate(d.getDate() + diff);
        return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* XP Toast */}
            {showBadgeToast && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, background: 'linear-gradient(135deg, #6366f1, #22c55e)', color: '#fff', padding: '12px 24px', borderRadius: '16px', fontWeight: 700, fontSize: '14px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', animation: 'slideUp 0.3s ease' }}>
                    {showBadgeToast}
                </div>
            )}

            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #22c55e)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚔️</span>
                        DSA Arena
                        <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', letterSpacing: '0.1em' }}>BETA</span>
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Your dedicated coding practice ecosystem · Powered by EdVance AI</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ padding: '6px 16px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 800, fontSize: '13px' }}>
                        ⚡ {xp} XP
                    </div>
                    <div style={{ padding: '6px 16px', borderRadius: '99px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 800, fontSize: '13px' }}>
                        🔥 {streak} Day Streak
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '6px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                {[
                    { id: 'home', label: '🏠 Home' },
                    { id: 'topics', label: '📚 Topics' },
                    { id: 'problems', label: '📋 Problem Bank' },
                    { id: 'workspace', label: '💻 Workspace' },
                    { id: 'contests', label: '🏆 Contests' },
                    { id: 'placement', label: '💼 Placement' },
                    { id: 'analytics', label: '📊 Analytics' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: '12px', transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: HOME ── */}
            {activeTab === 'home' && (
                <div className="space-y-6">
                    {/* Profile Summary Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        {[
                            { label: 'Contest Rating', value: '—', icon: '📈', color: '#6366f1' },
                            { label: 'Global Rank', value: '—', icon: '🌍', color: '#0ea5e9' },
                            { label: 'Problems Solved', value: totalSolved, icon: '✅', color: '#10b981' },
                            { label: 'Current Streak', value: `${streak}d`, icon: '🔥', color: '#ef4444' },
                            { label: 'XP from Coding', value: xp, icon: '⚡', color: '#f59e0b' },
                            { label: 'Badges Earned', value: BADGES.filter(b => {
                                if (!b.topic) return false;
                                const topicSolved = [...solvedProblems].filter(id => PROBLEMS[b.topic]?.find(p => p.id === id)).length;
                                return topicSolved >= b.reqCount;
                            }).length, icon: '🏅', color: '#a855f7' },
                        ].map(stat => (
                            <div key={stat.label} style={{ padding: '20px 16px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '22px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Difficulty Distribution + Progress */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {/* Difficulty */}
                        <div style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Difficulty Breakdown</h3>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <CircularProgress solved={totalSolved} total={200} size={120} />
                                <div style={{ flex: 1 }}>
                                    {[
                                        { label: 'Easy', solved: easySolved, total: 80, color: '#22c55e' },
                                        { label: 'Medium', solved: mediumSolved, total: 90, color: '#f59e0b' },
                                        { label: 'Hard', solved: hardSolved, total: 30, color: '#ef4444' },
                                    ].map(d => (
                                        <div key={d.label} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: d.color }}>{d.label}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>{d.solved}/{d.total}</span>
                                            </div>
                                            <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(d.solved / d.total) * 100}%`, background: d.color, borderRadius: '99px', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px' }}>Recent Activity</h3>
                            {[...solvedProblems].slice(-4).reverse().map(id => {
                                let prob = null;
                                for (const ps of Object.values(PROBLEMS)) { prob = ps.find(p => p.id === id); if (prob) break; }
                                if (!prob) return null;
                                return (
                                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span>
                                        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{prob.title}</span>
                                        <DiffBadge difficulty={prob.difficulty} />
                                    </div>
                                );
                            })}
                            {solvedProblems.size === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
                                    <p style={{ fontSize: '13px', fontWeight: 600 }}>Start solving problems to see your activity!</p>
                                    <button onClick={() => setActiveTab('topics')} style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                                        Browse Topics →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Coding Activity Heatmap</h3>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                {[
                                    { label: 'Total Active Days', value: Object.keys(solvedDates).length },
                                    { label: 'Longest Streak', value: '5 days' },
                                    { label: 'Problems / Day', value: '0.3' },
                                ].map(s => (
                                    <div key={s.label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ActivityHeatmap solvedDates={solvedDates} />
                    </div>
                </div>
            )}

            {/* ── TAB: TOPICS ── */}
            {activeTab === 'topics' && (
                <div className="space-y-6">
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Topic Explorer</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Master each topic systematically · Phase 1 — Core DSA</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {TOPICS.map((topic) => {
                            const topicSolved = [...solvedProblems].filter(id => PROBLEMS[topic.id]?.find(p => p.id === id)).length;
                            const attempted = topicSolved > 0;
                            return (
                                <div key={topic.id}
                                    style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg-card)', border: `1px solid ${attempted ? '#22c55e40' : 'var(--border-color)'}`, boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                                    {/* Solved glow */}
                                    {attempted && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #22c55e, #10b981)' }} />}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '32px' }}>{topic.emoji}</div>
                                        {attempted && <span style={{ fontSize: '11px', fontWeight: 800, color: '#22c55e', background: '#dcfce7', padding: '2px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}><HiCheck style={{ width: '12px', height: '12px' }} /> Attempted</span>}
                                    </div>

                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{topic.name}</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{topic.total} Problems</p>

                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Easy: {topic.easy}</span>
                                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: '#fef9c3', color: '#a16207', fontWeight: 700 }}>Med: {topic.medium}</span>
                                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>Hard: {topic.hard}</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Solved: {topicSolved}</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{Math.round((topicSolved / topic.total) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '5px', borderRadius: '99px', background: 'var(--border-color)' }}>
                                            <div style={{ height: '100%', width: `${(topicSolved / topic.total) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #22c55e)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>

                                    <button onClick={() => openTopic(topic)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '12px', transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.target.style.opacity = '0.9'}
                                        onMouseLeave={e => e.target.style.opacity = '1'}>
                                        Open Topic →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── TAB: PROBLEM BANK ── */}
            {activeTab === 'problems' && (
                <div className="space-y-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setActiveTab('topics')} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <HiOutlineArrowLeft style={{ width: '18px', height: '18px' }} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {selectedTopic ? `${selectedTopic.emoji} ${selectedTopic.name}` : 'Problem Bank'}
                            </h2>
                            {selectedTopic && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedTopic.total} problems · Select a problem to start solving</p>}
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['All', 'Easy', 'Medium', 'Hard', 'Solved', 'Unsolved'].map(f => (
                            <button key={f} onClick={() => setDiffFilter(f)}
                                style={{ padding: '7px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s',
                                    background: diffFilter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
                                    color: diffFilter === f ? '#fff' : 'var(--text-secondary)',
                                    borderColor: diffFilter === f ? 'transparent' : 'var(--border-color)',
                                }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Problem List */}
                    <div style={{ borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px', gap: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Difficulty</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>XP</span>
                        </div>
                        {(selectedTopic ? PROBLEMS[selectedTopic.id] : Object.values(PROBLEMS).flat())
                            .filter(p => {
                                if (diffFilter === 'All') return true;
                                if (diffFilter === 'Solved') return solvedProblems.has(p.id);
                                if (diffFilter === 'Unsolved') return !solvedProblems.has(p.id);
                                return p.difficulty === diffFilter;
                            })
                            .map((problem, i) => {
                                const solved = solvedProblems.has(problem.id);
                                return (
                                    <div key={problem.id}
                                        onClick={() => openProblem(problem)}
                                        style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px', gap: '12px', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'}>
                                        <div style={{ textAlign: 'center', fontSize: '16px', color: solved ? '#22c55e' : 'var(--text-muted)', fontWeight: 900 }}>
                                            {solved ? '✓' : '○'}
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{problem.title}</span>
                                        <DiffBadge difficulty={problem.difficulty} />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: problem.difficulty === 'Easy' ? '#22c55e' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                                            {problem.difficulty === 'Easy' ? '+5' : problem.difficulty === 'Medium' ? '+15' : '+30'} XP
                                        </span>
                                    </div>
                                );
                            })}
                        {(!selectedTopic || PROBLEMS[selectedTopic.id]?.length === 0) && (
                            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '14px' }}>No problems match the current filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB: WORKSPACE ── */}
            {activeTab === 'workspace' && selectedProblem && (
                <div>
                    {/* Back navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <button onClick={() => setActiveTab('problems')} style={{ padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <HiOutlineArrowLeft style={{ width: '14px', height: '14px' }} /> Back
                        </button>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {selectedTopic?.name} → {selectedProblem.title}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '600px' }}>

                        {/* LEFT: Problem Statement */}
                        <div style={{ borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                    <DiffBadge difficulty={selectedProblem.difficulty} />
                                    {solvedProblems.has(selectedProblem.id) && (
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: '#dcfce7', padding: '2px 10px', borderRadius: '99px' }}>✓ Solved</span>
                                    )}
                                </div>
                                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedProblem.title}</h2>
                            </div>

                            {/* Tabs inside problem */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                                {[
                                    { id: null, label: 'Description' },
                                    { id: 'hint', label: '💡 AI Hint' },
                                    { id: 'explain', label: '🤖 AI Explain' },
                                    { id: 'interview', label: '🎤 Mock Interview' },
                                ].map(tab => (
                                    <button key={tab.label} onClick={() => setAiPanel(tab.id)}
                                        style={{ flex: 1, padding: '10px 8px', border: 'none', borderBottom: aiPanel === tab.id ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: aiPanel === tab.id ? '#6366f1' : 'var(--text-muted)', background: 'transparent', transition: 'all 0.2s' }}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                                {aiPanel === null && (
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{selectedProblem.description}</p>

                                        {selectedProblem.examples?.map((ex, i) => (
                                            <div key={i} style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                                <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>EXAMPLE {i + 1}</p>
                                                <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                                                    <p style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Input:</span> {ex.input}</p>
                                                    <p style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Output:</span> {ex.output}</p>
                                                    {ex.explanation && <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '12px' }}>Explanation: {ex.explanation}</p>}
                                                </div>
                                            </div>
                                        ))}

                                        <div style={{ marginBottom: '20px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>CONSTRAINTS</p>
                                            <ul style={{ paddingLeft: '20px' }}>
                                                {selectedProblem.constraints?.map((c, i) => (
                                                    <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '4px' }}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* AI Hint Panel */}
                                {aiPanel === 'hint' && (
                                    <div className="space-y-4">
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💡</div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Hints</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No direct answers — guided discovery</p>
                                            </div>
                                        </div>
                                        {selectedProblem.aiHints?.slice(0, hintIndex + 1).map((h, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{h}</p>
                                            </div>
                                        ))}
                                        {hintIndex < (selectedProblem.aiHints?.length - 1) && (
                                            <button onClick={() => setHintIndex(h => h + 1)}
                                                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                                                Show Next Hint →
                                            </button>
                                        )}
                                        {hintIndex >= (selectedProblem.aiHints?.length - 1) && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>All hints revealed. Trust your skills! 💪</p>
                                        )}
                                    </div>
                                )}

                                {/* AI Explain Panel */}
                                {aiPanel === 'explain' && (
                                    <div className="space-y-4">
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Code Explainer</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Complexity analysis & optimization tips</p>
                                            </div>
                                        </div>
                                        {[
                                            { label: '⏱ Time Complexity', value: selectedProblem.aiExplain?.time, color: '#6366f1' },
                                            { label: '🧠 Space Complexity', value: selectedProblem.aiExplain?.space, color: '#8b5cf6' },
                                        ].map(m => (
                                            <div key={m.label} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.label}</span>
                                                <span style={{ fontSize: '15px', fontWeight: 900, fontFamily: 'monospace', color: m.color }}>{m.value}</span>
                                            </div>
                                        ))}
                                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', marginBottom: '8px' }}>✨ OPTIMIZATION SUGGESTION</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedProblem.aiExplain?.suggestion}</p>
                                        </div>
                                    </div>
                                )}

                                {/* AI Interview Panel */}
                                {aiPanel === 'interview' && (
                                    <div className="space-y-4">
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎤</div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Mock Interviewer</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI follow-up questions to deepen understanding</p>
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '8px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>INTERVIEWER</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Great! You've implemented a solution. Let me ask you a few follow-up questions...</p>
                                        </div>
                                        {selectedProblem.aiInterview?.map((q, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>Q{i + 1}</p>
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic' }}>"{q}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Code Editor */}
                        <div style={{ borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
                            {/* Editor header */}
                            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
                                </div>
                                <select value={language} onChange={e => setLanguage(e.target.value)}
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #30363d', background: '#161b22', color: '#c9d1d9', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                    {['Python', 'Java', 'C++', 'JavaScript'].map(l => <option key={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* Code area */}
                            <div style={{ flex: 1, background: '#0d1117', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', bottom: 0, background: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '14px', gap: '0' }}>
                                    {code.split('\n').map((_, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#6e7681', lineHeight: '1.6', fontFamily: 'monospace', height: '19.2px' }}>{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{
                                        width: '100%', height: '100%', minHeight: '320px', background: 'transparent', border: 'none', outline: 'none',
                                        color: '#c9d1d9', fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                        fontSize: '13px', lineHeight: '1.6', padding: '14px 16px 14px 52px',
                                        resize: 'none', tabSize: 4,
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; const newCode = code.substring(0, s) + '    ' + code.substring(e.target.selectionEnd); setCode(newCode); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0); }
                                    }}
                                />
                            </div>

                            {/* Run result banner */}
                            {runResult && (
                                <div style={{ padding: '10px 20px', background: runResult === 'pass' ? '#dcfce7' : '#fee2e2', borderTop: '1px solid var(--border-color)' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: runResult === 'pass' ? '#15803d' : '#dc2626' }}>
                                        {runResult === 'pass' ? '✓ All test cases passed! (2/2)' : '✗ Wrong Answer on test case 1'}
                                    </p>
                                </div>
                            )}

                            {/* Submit result banner */}
                            {submitResult && (
                                <div style={{ padding: '10px 20px', background: submitResult === 'accepted' ? '#dcfce7' : '#fee2e2', borderTop: '1px solid var(--border-color)' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: submitResult === 'accepted' ? '#15803d' : '#dc2626' }}>
                                        {submitResult === 'accepted' ? '🎉 Accepted! Solution passed all test cases.' : '✗ Wrong Answer — Check your logic.'}
                                    </p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'var(--bg-card)' }}>
                                <button onClick={handleRun}
                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <HiOutlinePlay style={{ width: '14px', height: '14px' }} /> Run
                                </button>
                                <button onClick={handleSubmit}
                                    style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #22c55e, #10b981)', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <HiOutlineCheckCircle style={{ width: '14px', height: '14px' }} /> Submit
                                </button>
                                <button onClick={() => setCode(getDefaultCode(selectedProblem, language))}
                                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                                    title="Reset">
                                    <HiOutlineRefresh style={{ width: '14px', height: '14px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'workspace' && !selectedProblem && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💻</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Problem Selected</h3>
                    <p style={{ fontSize: '14px', marginBottom: '24px' }}>Go to Topics or Problem Bank and click a problem to open it here.</p>
                    <button onClick={() => setActiveTab('topics')} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                        Browse Topics →
                    </button>
                </div>
            )}

            {/* ── TAB: WEEKLY CONTESTS ── */}
            {activeTab === 'contests' && (
                <div className="space-y-6">
                    {/* Contest Banner */}
                    <div style={{ borderRadius: '24px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '40px', position: 'relative', overflow: 'hidden', color: '#fff' }}>
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 14px', borderRadius: '99px', background: 'rgba(245,158,11,0.3)', color: '#fbbf24', letterSpacing: '0.1em' }}>WEEKLY CONTEST</span>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginTop: '12px', marginBottom: '8px' }}>Sunday Coding Challenge</h2>
                            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>Next contest: {nextSunday()} · 10:00 AM IST</p>
                            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '28px' }}>
                                {[
                                    { label: 'Duration', value: '90 Minutes' },
                                    { label: 'Problems', value: '5 (2E + 2M + 1H)' },
                                    { label: 'Participants', value: '1,200+' },
                                    { label: 'Prize', value: 'XP + Badges' },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div style={{ fontSize: '20px', fontWeight: 900 }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: 600 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <button style={{ padding: '14px 36px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>
                                🔔 Set Reminder
                            </button>
                        </div>
                    </div>

                    {/* Contest Structure */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {[
                            { label: 'Easy Problems', count: 2, points: '100 pts each', color: '#22c55e' },
                            { label: 'Medium Problems', count: 2, points: '200 pts each', color: '#f59e0b' },
                            { label: 'Hard Problem', count: 1, points: '500 pts each', color: '#ef4444' },
                        ].map(c => (
                            <div key={c.label} style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-card)', border: `2px solid ${c.color}30`, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ fontSize: '36px', fontWeight: 900, color: c.color }}>{c.count}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{c.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.points}</div>
                            </div>
                        ))}
                    </div>

                    {/* Leaderboard */}
                    <div style={{ borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>🏆 Last Contest Leaderboard</h3>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Week #24</span>
                        </div>
                        <div style={{ padding: '0 24px 16px' }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 100px', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                {['Rank', 'Participant', 'Solved', 'Penalty', 'Score'].map(h => (
                                    <span key={h} style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</span>
                                ))}
                            </div>
                            {CONTEST_LEADERBOARD.map((row, i) => (
                                <div key={row.rank} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 100px', gap: '12px', padding: '14px 0', borderBottom: i < 9 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', background: i < 3 ? `rgba(${i === 0 ? '245,158,11' : i === 1 ? '156,163,175' : '180,120,60'},0.05)` : 'transparent' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '16px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: i < 3 ? '#f59e0b' : 'var(--text-muted)' }}>#{row.rank}</span>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{row.solved}/5</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{row.penalty}m</span>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#6366f1' }}>{row.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: PLACEMENT SHEETS ── */}
            {activeTab === 'placement' && (
                <div className="space-y-6">
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>💼 Placement Preparation</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Company-specific curated problem sets · Crack your dream job</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {COMPANIES.map(company => {
                            const solved = 0;
                            const pct = Math.round((solved / company.total) * 100);
                            const isExpanded = expandedCompany === company.id;
                            return (
                                <div key={company.id} style={{ borderRadius: '20px', background: 'var(--bg-card)', border: `1px solid var(--border-color)`, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s' }}>
                                    <div style={{ padding: '24px', cursor: 'pointer' }} onClick={() => setExpandedCompany(isExpanded ? null : company.id)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${company.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{company.emoji}</div>
                                                <div>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{company.name}</h3>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{company.total} problems</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 900, color: company.color }}>{pct}%</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Complete</div>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Solved: {solved}/{company.total}</span>
                                            </div>
                                            <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-color)' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: company.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>E: {Math.floor(company.total * 0.4)}</span>
                                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', background: '#fef9c3', color: '#a16207', fontWeight: 700 }}>M: {Math.floor(company.total * 0.4)}</span>
                                                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>H: {Math.floor(company.total * 0.2)}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{isExpanded ? '▲ Hide' : '▼ View'}</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px 24px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>SAMPLE PROBLEMS</p>
                                            {[
                                                `${company.name} OA Problem 1 — Easy`,
                                                `${company.name} Interview Round 2 — Medium`,
                                                `${company.name} Final Round — Hard`,
                                            ].map((title, i) => (
                                                <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{title.split('—')[0].trim()}</span>
                                                    <DiffBadge difficulty={i === 0 ? 'Easy' : i === 1 ? 'Medium' : 'Hard'} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── TAB: ANALYTICS ── */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>📊 Performance Analytics</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Track your progress · Identify strengths & improvement areas</p>
                    </div>

                    {/* Metric Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                        {[
                            { label: 'Total Solved', value: totalSolved, icon: '✅', color: '#22c55e', bg: '#dcfce7' },
                            { label: 'Easy Solved', value: easySolved, icon: '🟢', color: '#22c55e', bg: '#dcfce7' },
                            { label: 'Medium Solved', value: mediumSolved, icon: '🟡', color: '#f59e0b', bg: '#fef9c3' },
                            { label: 'Hard Solved', value: hardSolved, icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
                            { label: 'Success Rate', value: totalSolved > 0 ? `${Math.round((totalSolved / (totalSolved + 2)) * 100)}%` : '0%', icon: '🎯', color: '#6366f1', bg: '#ede9fe' },
                            { label: 'Avg Time', value: '12m', icon: '⏱', color: '#0ea5e9', bg: '#e0f2fe' },
                            { label: 'Contests', value: 0, icon: '🏆', color: '#f59e0b', bg: '#fef9c3' },
                            { label: 'Current Streak', value: `${streak}d`, icon: '🔥', color: '#ef4444', bg: '#fee2e2' },
                            { label: 'Longest Streak', value: '5d', icon: '⚡', color: '#f59e0b', bg: '#fef9c3' },
                        ].map(m => (
                            <div key={m.label} style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>{m.icon}</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: m.color }}>{m.value}</div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Topic Mastery Grid */}
                    <div style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Topic Mastery</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {TOPICS.map(topic => {
                                const topicSolved = [...solvedProblems].filter(id => PROBLEMS[topic.id]?.find(p => p.id === id)).length;
                                const pct = Math.round((topicSolved / topic.total) * 100);
                                return (
                                    <div key={topic.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 50px', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{topic.emoji} {topic.name}</span>
                                        <div style={{ height: '8px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#6366f1' : '#e2e8f0', borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>{topicSolved}/{topic.total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Coding Badges</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                            {BADGES.map(badge => {
                                let earned = false;
                                if (badge.topic) {
                                    const cnt = [...solvedProblems].filter(id => PROBLEMS[badge.topic]?.find(p => p.id === id)).length;
                                    earned = cnt >= badge.reqCount;
                                } else if (badge.id === '50-solved') earned = totalSolved >= 50;
                                else if (badge.id === '100-solved') earned = totalSolved >= 100;
                                return (
                                    <div key={badge.id} style={{ textAlign: 'center', opacity: earned ? 1 : 0.35, transition: 'all 0.2s' }}
                                        title={badge.req}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: earned ? badge.color : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 8px', boxShadow: earned ? `0 4px 16px ${badge.color}40` : 'none', transition: 'all 0.3s' }}>
                                            {badge.emoji}
                                        </div>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{badge.name}</p>
                                        {earned && <p style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700, marginTop: '2px' }}>✓ Earned</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* XP Reward Table */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>⚡ XP Rewards</h3>
                            {[
                                { label: 'Easy Problem', xp: 5, color: '#22c55e' },
                                { label: 'Medium Problem', xp: 15, color: '#f59e0b' },
                                { label: 'Hard Problem', xp: 30, color: '#ef4444' },
                                { label: '3-Day Streak', xp: 20, color: '#6366f1' },
                                { label: '7-Day Streak', xp: 50, color: '#8b5cf6' },
                                { label: '30-Day Streak', xp: 200, color: '#f97316' },
                            ].map(r => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{r.label}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 900, color: r.color }}>+{r.xp} XP</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>📈 Your Stats</h3>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <CircularProgress solved={totalSolved} total={200} size={140} strokeWidth={12} />
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '16px' }}>Problems Solved</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {200 - totalSolved} more to reach the goal of 200!
                                </p>
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#22c55e' }}>{easySolved}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Easy</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>{mediumSolved}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Medium</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#ef4444' }}>{hardSolved}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hard</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Missing icon alias
const HiOutlineHome2 = HiOutlineBookOpen;
