// Interview practice problems for the DSA stack.
// These are DIFFERENT problems from the ones solved inside src/data/dsa.js topics.
// They practise the same patterns. Every solution was run with Node against the examples and edge cases.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'dsa',
  problems: [
    // ───────────────────────────── EASY ─────────────────────────────
    {
      id: 'majority-element',
      title: 'Majority Element',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'hashmap-problems-easy',
      question: `Given an array \`nums\` of size \`n\`, return the **majority element**. The majority element is the value that appears **more than n / 2 times**. You can assume it always exists.

\`\`\`text
Input:  nums = [3, 2, 3]
Output: 3

Input:  nums = [2, 2, 1, 1, 1, 2, 2]
Output: 2
\`\`\`

**Constraints:** 1 ≤ n ≤ 50,000. Values can be negative.

**Follow-up:** can you do it in O(n) time and **O(1)** extra space?`,
      hints: [
        'Easy first version: count every value with a Map, then return the one whose count is more than n / 2.',
        'For O(1) space: think of a "vote". The majority value appears more often than all other values put together.',
        'Keep a `candidate` and a `count`. Same value as candidate: count++. Different value: count--. When count is 0, the next value becomes the new candidate (Boyer-Moore voting).',
      ],
      solution: `**Idea:** brute force counts each value with a Map (O(n) time, O(n) space). The optimal trick is **Boyer-Moore voting**: imagine every majority value "fights" one different value and both disappear. Because the majority has more than half the votes, it is the one left standing.

\`\`\`javascript
function majorityElement(nums) {
  let candidate = null;
  let count = 0;

  for (const num of nums) {
    if (count === 0) {
      candidate = num;          // no current leader, so pick this value
    }
    // same as leader -> one more vote, different -> one vote cancelled
    count += num === candidate ? 1 : -1;
  }

  return candidate;             // safe because a majority always exists
}

console.log(majorityElement([3, 2, 3]));             // 3
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2
\`\`\`

**Dry run** for \`[2, 2, 1, 1, 1, 2, 2]\`:

- 2 → candidate 2, count 1
- 2 → count 2
- 1 → count 1, 1 → count 0
- 1 → count was 0, so candidate becomes 1, count 1
- 2 → count 0
- 2 → count was 0, so candidate becomes 2, count 1 → answer **2**

**Complexity:** O(n) time, O(1) space.

**Edge cases:** a single element is its own majority. Negative numbers work the same.`,
      followUps: [
        {
          q: 'What if the majority element might NOT exist?',
          a: 'Run Boyer-Moore to get a candidate, then do a second pass to count how often it really appears. Return it only if the count is more than n / 2.',
        },
        {
          q: 'How would you find all elements that appear more than n / 3 times?',
          a: 'There can be at most 2 such values. Use the same voting idea with **two** candidates and two counters, then verify both with a second pass.',
        },
      ],
    },
    {
      id: 'merge-sorted-array',
      title: 'Merge Sorted Array (in place)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'two-pointers',
      question: `You get two sorted arrays \`nums1\` and \`nums2\`, plus two numbers \`m\` and \`n\`. The first \`m\` items of \`nums1\` are real values. The last \`n\` slots of \`nums1\` are \`0\` placeholders (empty space). Merge \`nums2\` into \`nums1\` **in place**, so \`nums1\` becomes one sorted array.

\`\`\`text
Input:  nums1 = [1, 2, 3, 0, 0, 0], m = 3
        nums2 = [2, 5, 6],          n = 3
Output: nums1 = [1, 2, 2, 3, 5, 6]

Input:  nums1 = [0], m = 0, nums2 = [1], n = 1
Output: nums1 = [1]
\`\`\`

**Constraints:** \`nums1.length === m + n\`, 0 ≤ m, n ≤ 200. Values can be negative.`,
      hints: [
        'Brute force: copy nums2 into the empty slots and sort. That is O((m+n) log(m+n)). Can you use the fact that both arrays are already sorted?',
        'Filling from the front overwrites values you still need. Where is the free space? At the **end** of nums1.',
        'Use three pointers: i at the last real value of nums1, j at the end of nums2, k at the very end of nums1. Put the bigger of nums1[i] and nums2[j] at k, then move left.',
      ],
      solution: `**Idea:** brute force is "copy then sort". Better: fill \`nums1\` **from the back**. The biggest value goes to the last slot. The back is empty space, so we never overwrite a value we still need.

\`\`\`javascript
function merge(nums1, m, nums2, n) {
  let i = m - 1;       // last real value in nums1
  let j = n - 1;       // last value in nums2
  let k = m + n - 1;   // last slot in nums1

  // keep going while nums2 still has values to place
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i]; // nums1 value is bigger, move it to the back
      i--;
    } else {
      nums1[k] = nums2[j]; // nums2 value is bigger (or nums1 is used up)
      j--;
    }
    k--;
  }
  // if nums2 is used up, the rest of nums1 is already in the right place
}

const a = [1, 2, 3, 0, 0, 0];
merge(a, 3, [2, 5, 6], 3);
console.log(a); // [1, 2, 2, 3, 5, 6]
\`\`\`

**Dry run** (\`[1,2,3,_,_,_]\` and \`[2,5,6]\`): 6 > 3 → slot 5 = 6. 5 > 3 → slot 4 = 5. 3 > 2 → slot 3 = 3. 2 vs 2 → take nums2's 2 → slot 2 = 2. nums2 is empty, stop. Result \`[1,2,2,3,5,6]\`.

**Complexity:** O(m + n) time, O(1) space.

**Edge cases:** \`m = 0\` (all values come from nums2), \`n = 0\` (nothing to do).`,
      followUps: [
        {
          q: 'Why do we loop on `j >= 0` and not on `i >= 0`?',
          a: 'When nums2 runs out, the leftover nums1 values are already sorted and already in place. But when nums1 runs out, nums2 values still need to be copied in.',
        },
        {
          q: 'Where is this pattern used in real life?',
          a: 'It is the "merge" step of merge sort, and the same idea merges two sorted lists from two database queries or two paginated APIs.',
        },
      ],
    },
    {
      id: 'remove-duplicates-sorted-array',
      title: 'Remove Duplicates from Sorted Array',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'two-pointers',
      question: `Given a **sorted** array \`nums\`, remove the duplicates **in place** so each value appears only once. Return \`k\`, the number of unique values. The first \`k\` items of \`nums\` must hold the unique values in order. What is after them does not matter.

\`\`\`text
Input:  nums = [1, 1, 2]
Output: 2, nums starts with [1, 2]

Input:  nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
Output: 5, nums starts with [0, 1, 2, 3, 4]
\`\`\`

**Constraints:** 0 ≤ nums.length ≤ 30,000. Do not create a new array (O(1) extra space).`,
      hints: [
        'Because the array is sorted, duplicates sit next to each other.',
        'Use two pointers that move in the same direction: one **reads** every value, one **writes** the next unique value.',
        'Compare nums[read] with the last written unique value nums[write - 1]. If it is different, copy it to nums[write] and move write forward.',
      ],
      solution: `**Idea:** brute force would build a \`new Set\` and copy it back, but that uses extra memory. Optimal: a **read/write pointer** pair. \`write\` marks where the next unique value goes. Because the array is sorted, a value is new only if it differs from the last unique value we wrote.

\`\`\`javascript
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let write = 1; // nums[0] is always unique, so start writing at index 1

  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read]; // found a new value, keep it
      write++;
    }
  }

  return write; // number of unique values
}

const nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
console.log(removeDuplicates(nums), nums.slice(0, 5)); // 5 [0, 1, 2, 3, 4]
\`\`\`

**Dry run** for \`[1, 1, 2]\`: write = 1. read = 1: 1 equals nums[0], skip. read = 2: 2 differs from nums[0] = 1, so nums[1] = 2, write = 2. Return **2**, array starts \`[1, 2]\`.

**Complexity:** O(n) time, O(1) space.

**Edge cases:** empty array returns 0. One element returns 1. Negative values work the same.`,
      followUps: [
        {
          q: 'What if each value may appear at most twice?',
          a: 'Compare with `nums[write - 2]` instead of `nums[write - 1]` (and start write at 2). A value is allowed if it is different from the one two places back.',
        },
        {
          q: 'What if the array is not sorted?',
          a: 'Duplicates are no longer next to each other. Use a `Set` of seen values while writing (O(n) space), or sort first (O(n log n)).',
        },
      ],
    },
    {
      id: 'plus-one',
      title: 'Plus One',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'arrays',
      question: `A large integer is stored as an array of digits. The most significant digit is first. Add **one** to the number and return the new array of digits.

\`\`\`text
Input:  digits = [1, 2, 3]   (the number 123)
Output: [1, 2, 4]

Input:  digits = [9, 9]      (the number 99)
Output: [1, 0, 0]
\`\`\`

**Constraints:** 1 ≤ digits.length ≤ 100. No leading zeros (except the number 0 itself). The number can be too big for a normal JavaScript number.`,
      hints: [
        'Do not convert to a Number: 100 digits is too big and you lose precision. Do it the way you add by hand.',
        'Start from the last digit. If it is less than 9, add 1 and you are done.',
        'If it is 9, it becomes 0 and the 1 "carries" to the next digit on the left. If every digit was 9, put a 1 at the front.',
      ],
      solution: `**Idea:** brute force would turn the array into a number, add 1 and split it back. That breaks for big numbers (JavaScript numbers are only exact up to about 16 digits). Instead, add 1 the way you learned at school: from right to left, with a **carry**.

\`\`\`javascript
function plusOne(digits) {
  const result = [...digits]; // do not change the input array

  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] < 9) {
      result[i]++;      // no carry needed, we are done
      return result;
    }
    result[i] = 0;      // 9 + 1 = 10, write 0 and carry 1 to the left
  }

  // every digit was 9 (like 999), so the answer is 1 followed by zeros
  return [1, ...result];
}

console.log(plusOne([1, 2, 3])); // [1, 2, 4]
console.log(plusOne([9, 9]));    // [1, 0, 0]
\`\`\`

**Dry run** for \`[1, 9, 9]\`: last 9 → 0 (carry). Middle 9 → 0 (carry). 1 < 9 → becomes 2, return \`[2, 0, 0]\`.

**Complexity:** O(n) time, O(n) space for the copy (O(1) extra if you are allowed to change the input).

**Edge cases:** \`[0]\` → \`[1]\`, \`[9]\` → \`[1, 0]\`.`,
      followUps: [
        {
          q: 'Could you use BigInt instead?',
          a: 'Yes: `BigInt(digits.join(\'\')) + 1n`, then split the string. It works, but interviewers want to see the carry logic, which is also the core of "Add Two Numbers" and "Add Strings".',
        },
        {
          q: 'How would you add two digit arrays?',
          a: 'Walk both from the end, add the two digits plus the carry, write `sum % 10`, carry `Math.floor(sum / 10)`. At the end, if carry is 1, add it at the front.',
        },
      ],
    },
    {
      id: 'isomorphic-strings',
      title: 'Isomorphic Strings',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'hashmaps',
      question: `Two strings \`s\` and \`t\` are **isomorphic** if you can replace characters in \`s\` to get \`t\`. Rules: every copy of a character must be replaced by the same character, and two different characters cannot map to the same character. A character may map to itself.

\`\`\`text
Input:  s = "egg",   t = "add"    Output: true   (e→a, g→d)
Input:  s = "foo",   t = "bar"    Output: false  (o would need to be both a and r)
Input:  s = "paper", t = "title"  Output: true
Input:  s = "badc",  t = "baba"   Output: false  (b→b and d→b: two letters map to b)
\`\`\`

**Constraints:** \`s.length === t.length\`, up to 50,000 characters.`,
      hints: [
        'Store the mapping s-character → t-character in a Map and check it stays the same.',
        'One map is not enough: "badc" / "baba" passes a one-way check. You must also make sure no two s-characters map to the same t-character.',
        'Use two maps (s→t and t→s), or one map plus a Set of t-characters already used.',
      ],
      solution: `**Idea:** walk both strings together. Keep two maps: \`sToT\` and \`tToS\`. If a pair breaks either map, the strings are not isomorphic. Two maps make the mapping work **both ways** (a "one-to-one" mapping).

\`\`\`javascript
function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;

  const sToT = new Map();
  const tToS = new Map();

  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];

    // a was already mapped to something else -> conflict
    if (sToT.has(a) && sToT.get(a) !== b) return false;
    // b is already used by a different character -> conflict
    if (tToS.has(b) && tToS.get(b) !== a) return false;

    sToT.set(a, b);
    tToS.set(b, a);
  }
  return true;
}

console.log(isIsomorphic('egg', 'add'));   // true
console.log(isIsomorphic('foo', 'bar'));   // false
console.log(isIsomorphic('badc', 'baba')); // false
\`\`\`

**Dry run** for \`"badc"\` / \`"baba"\`: b→b ok, a→a ok, d→b: \`sToT\` has no d, but \`tToS\` says b already belongs to b, not d → **false**.

**Complexity:** O(n) time. O(k) space where k is the number of different characters (at most the alphabet size).

**Edge cases:** two empty strings are isomorphic. Different lengths are never isomorphic.`,
      followUps: [
        {
          q: 'How is "Word Pattern" (pattern "abba", s "dog cat cat dog") related?',
          a: 'It is the same problem, but the second side is words instead of characters. Split `s` by spaces, check the lengths match, then use the same two-map check.',
        },
        {
          q: 'Is there a one-pass trick without two maps?',
          a: 'Yes: compare the "first index seen" of each character. Map each char of s and t to the index where it first appeared; the strings are isomorphic if these index sequences are equal.',
        },
      ],
    },
    {
      id: 'ransom-note',
      title: 'Ransom Note',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'hashmap-problems-easy',
      question: `Given two strings \`ransomNote\` and \`magazine\`, return \`true\` if you can build \`ransomNote\` by cutting letters out of \`magazine\`. Each letter in \`magazine\` can be used **only once**.

\`\`\`text
Input:  ransomNote = "a",  magazine = "b"    Output: false
Input:  ransomNote = "aa", magazine = "ab"   Output: false  (only one "a")
Input:  ransomNote = "aa", magazine = "aab"  Output: true
\`\`\`

**Constraints:** up to 100,000 lowercase letters in each string.`,
      hints: [
        'Brute force: for each note letter, search the magazine and delete the letter you used. That is O(n · m). Can you count instead?',
        'Count how many of each letter the magazine has (a Map or an array of 26).',
        'Then walk the note and "spend" letters: decrease the count. If a count would go below zero, return false.',
      ],
      solution: `**Idea:** brute force searches and removes letters one by one (slow). Optimal: build a **frequency map** of the magazine, then spend letters from it while reading the note.

\`\`\`javascript
function canConstruct(ransomNote, magazine) {
  if (ransomNote.length > magazine.length) return false; // quick exit

  const counts = new Map();
  for (const ch of magazine) {
    counts.set(ch, (counts.get(ch) || 0) + 1); // how many of each letter we have
  }

  for (const ch of ransomNote) {
    const left = counts.get(ch) || 0;
    if (left === 0) return false; // we need this letter but have none left
    counts.set(ch, left - 1);     // use one copy
  }
  return true;
}

console.log(canConstruct('aa', 'ab'));  // false
console.log(canConstruct('aa', 'aab')); // true
\`\`\`

**Dry run** for \`"aa"\` / \`"ab"\`: counts = {a: 1, b: 1}. First "a" → a becomes 0. Second "a" → a is 0 → **false**.

**Complexity:** O(n + m) time. O(1) space if only 26 letters (the map never has more than 26 keys), otherwise O(k) for k different characters.

**Edge cases:** an empty note is always possible (\`true\`). An empty magazine fails for any non-empty note.`,
      followUps: [
        {
          q: 'How would you make it faster in practice for lowercase letters only?',
          a: 'Use `new Array(26).fill(0)` and index with `ch.charCodeAt(0) - 97`. Arrays are faster than Map for a small fixed alphabet.',
        },
        {
          q: 'Which other problems use the same "count then spend" idea?',
          a: 'Valid Anagram, Find All Anagrams in a String, Minimum Window Substring and checking if a user has enough stock for each item in a shopping cart.',
        },
      ],
    },
    {
      id: 'middle-of-linked-list',
      title: 'Middle of the Linked List',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'linked-list-problems',
      question: `Given the \`head\` of a singly linked list, return the **middle node**. If there are two middle nodes (even length), return the **second** one.

\`\`\`text
Input:  1 -> 2 -> 3 -> 4 -> 5
Output: node 3   (the list from there is 3 -> 4 -> 5)

Input:  1 -> 2 -> 3 -> 4 -> 5 -> 6
Output: node 4   (two middles, 3 and 4: return the second)
\`\`\`

Each node looks like \`{ val, next }\`. **Constraints:** 1 to 100 nodes. Try to do it in **one pass**.`,
      hints: [
        'Simple version: count the nodes in one pass, then walk count / 2 steps in a second pass.',
        'One pass: use two pointers that move at different speeds.',
        'Slow moves 1 step, fast moves 2 steps. When fast reaches the end, slow is in the middle.',
      ],
      solution: `**Idea:** brute force counts the length and then walks to the middle (two passes). Optimal: **fast and slow pointers**. Fast moves twice as fast, so when fast has finished the list, slow has done exactly half.

\`\`\`javascript
// Node shape: class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }

function middleNode(head) {
  let slow = head;
  let fast = head;

  // fast needs two more nodes to jump, so check both
  while (fast !== null && fast.next !== null) {
    slow = slow.next;        // 1 step
    fast = fast.next.next;   // 2 steps
  }
  return slow;
}
\`\`\`

**Dry run** for \`1-2-3-4-5-6\`:

- start: slow 1, fast 1
- step 1: slow 2, fast 3
- step 2: slow 3, fast 5
- step 3: slow 4, fast null (went past 6) → stop, return **4**

**Complexity:** O(n) time, O(1) space.

**Edge cases:** one node returns itself. Two nodes return the second node.`,
      followUps: [
        {
          q: 'How would you return the FIRST middle for even lengths?',
          a: 'Change the loop to `while (fast.next && fast.next.next)`. Fast stops one step earlier, so slow stops at the first middle. This is the version you use to split a list for merge sort.',
        },
        {
          q: 'Where else is fast/slow used?',
          a: 'Detecting a cycle (Floyd\'s algorithm), Palindrome Linked List (find the middle, reverse the second half, compare) and Reorder List.',
        },
      ],
    },
    {
      id: 'symmetric-tree',
      title: 'Symmetric Tree',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'tree-problems-dfs',
      question: `Given the \`root\` of a binary tree, return \`true\` if the tree is a **mirror of itself** (symmetric around its center).

\`\`\`text
Symmetric (true):        Not symmetric (false):
      1                        1
    /   \\                     / \\
   2     2                   2   2
  / \\   / \\                   \\   \\
 3   4 4   3                   3   3
\`\`\`

In array (level-order) form: \`[1,2,2,3,4,4,3]\` → \`true\`, \`[1,2,2,null,3,null,3]\` → \`false\`.

Each node is \`{ val, left, right }\`. **Constraints:** 0 to 1000 nodes.`,
      hints: [
        'A tree is symmetric if its left subtree is a mirror of its right subtree.',
        'Write a helper `isMirror(a, b)` that compares two trees.',
        'Two trees are mirrors if their roots have the same value, a.left mirrors b.right, and a.right mirrors b.left.',
      ],
      solution: `**Idea:** this is like "Same Tree", but crossed. Compare the **outside** pair (left.left with right.right) and the **inside** pair (left.right with right.left) recursively.

\`\`\`javascript
// Node shape: class TreeNode { constructor(val, left = null, right = null) { ... } }

function isSymmetric(root) {
  if (root === null) return true;
  return isMirror(root.left, root.right);
}

function isMirror(a, b) {
  if (a === null && b === null) return true;   // both empty -> mirror
  if (a === null || b === null) return false;  // only one empty -> not mirror
  if (a.val !== b.val) return false;           // values differ

  return isMirror(a.left, b.right) &&          // outside pair
         isMirror(a.right, b.left);            // inside pair
}
\`\`\`

**Dry run** for \`[1,2,2,3,4,4,3]\`: compare 2 and 2 (equal). Outside: 3 vs 3 (equal, both have no children). Inside: 4 vs 4 (equal) → **true**.

For \`[1,2,2,null,3,null,3]\`: compare 2 and 2. Outside: left.left is null, right.right is 3 → one is null → **false**.

**Complexity:** O(n) time (each node checked once). O(h) space for the recursion, where h is the tree height.

**Edge cases:** empty tree and single node are symmetric.`,
      followUps: [
        {
          q: 'Can you do it without recursion?',
          a: 'Yes, with a queue of pairs. Push `[root.left, root.right]`. Pop a pair, check it, then push `[a.left, b.right]` and `[a.right, b.left]`.',
        },
        {
          q: 'How is this related to Invert Binary Tree?',
          a: 'A tree is symmetric if its left subtree equals the inverted right subtree. Mirror checking is just "Same Tree" with the children swapped on one side.',
        },
      ],
    },
    {
      id: 'path-sum',
      title: 'Path Sum (root-to-leaf)',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'tree-problems-dfs',
      question: `Given the \`root\` of a binary tree and a number \`targetSum\`, return \`true\` if there is a **root-to-leaf** path whose values add up to \`targetSum\`. A **leaf** is a node with no children.

\`\`\`text
          5
         / \\
        4   8
       /   / \\
      11  13  4
     /  \\      \\
    7    2      1

targetSum = 22  ->  true   (5 + 4 + 11 + 2)
\`\`\`

\`\`\`text
Input: root = [1, 2, 3], targetSum = 5  ->  false
Input: root = [],        targetSum = 0  ->  false  (no path at all)
\`\`\`

**Constraints:** 0 to 5000 nodes, values can be negative.`,
      hints: [
        'Walk down the tree with DFS and carry how much sum is still needed.',
        'At each node, subtract its value from the target before going to the children.',
        'Only check at a **leaf**: return true if the remaining target equals the leaf\'s value.',
      ],
      solution: `**Idea:** DFS from the root. Each step subtracts the node's value from what we still need. When we reach a leaf, we check if what we still need is exactly that leaf's value.

\`\`\`javascript
function hasPathSum(root, targetSum) {
  if (root === null) return false;            // empty tree has no path

  const remaining = targetSum - root.val;

  // leaf: the path ends here, so it must match exactly
  if (root.left === null && root.right === null) {
    return remaining === 0;
  }

  // try the left path, then the right path
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}
\`\`\`

**Dry run** (target 22): 5 → need 17. 4 → need 13. 11 → need 2. 7 is a leaf: 2 - 7 = -5, no. 2 is a leaf: 2 - 2 = 0 → **true**.

**Complexity:** O(n) time. O(h) space for recursion (h = height).

**Edge cases:**

- Empty tree → false, even if target is 0.
- \`[1, 2]\` with target 1 → false. Node 1 is **not** a leaf (it has a child), so "1" alone is not a root-to-leaf path. This is the most common bug.
- Negative values: you cannot stop early when the sum "goes over" the target.`,
      followUps: [
        {
          q: 'How would you return all the paths (Path Sum II)?',
          a: 'Use backtracking: keep a `path` array, push the node before recursing, and pop it after. At a leaf with remaining 0, push a copy `[...path]` into the results.',
        },
        {
          q: 'What if the path can start and end anywhere going downwards (Path Sum III)?',
          a: 'Use prefix sums with a hashmap, like "Subarray Sum Equals K", but on the root-to-node path. Count how many earlier prefix sums equal `currentSum - target`.',
        },
      ],
    },
    {
      id: 'diameter-of-binary-tree',
      title: 'Diameter of Binary Tree',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'tree-problems-dfs',
      question: `Return the **diameter** of a binary tree: the number of **edges** on the longest path between any two nodes. The path does **not** have to go through the root.

\`\`\`text
        1
       / \\
      2   3
     / \\
    4   5

Output: 3   (path 4 -> 2 -> 1 -> 3, or 5 -> 2 -> 1 -> 3)
\`\`\`

\`\`\`text
Input: [1, 2]  ->  1
Input: [1]     ->  0
\`\`\`

**Constraints:** 1 to 10,000 nodes.`,
      hints: [
        'At any node, the longest path that "bends" at that node is: height of left subtree + height of right subtree.',
        'Brute force calls a height() function for every node: O(n²). Can you get the height and the best path in the same DFS?',
        'Write `height(node)` that returns the height, and while computing it update a global `best = max(best, leftHeight + rightHeight)`.',
      ],
      solution: `**Idea:** brute force computes the height separately for every node (O(n²) on a skewed tree). Optimal: **one post-order DFS** (children first, then the node). The function returns the height to its parent, and on the side it records the longest path that bends at this node: \`leftHeight + rightHeight\`.

\`\`\`javascript
function diameterOfBinaryTree(root) {
  let best = 0;

  // returns the height of the subtree, counted in nodes
  function height(node) {
    if (node === null) return 0;

    const left = height(node.left);
    const right = height(node.right);

    // longest path that passes through this node, counted in edges
    best = Math.max(best, left + right);

    return 1 + Math.max(left, right); // tell the parent how tall we are
  }

  height(root);
  return best;
}
\`\`\`

**Dry run** for \`[1,2,3,4,5]\`: nodes 4, 5, 3 return 1. Node 2: left 1 + right 1 = 2 → best 2, returns 2. Node 1: left 2 + right 1 = 3 → best **3**.

**Complexity:** O(n) time, O(h) space for recursion.

**Why the answer can skip the root:** \`best\` is checked at **every** node, so a long path deep in one subtree is still found.`,
      followUps: [
        {
          q: 'Why count height in nodes but the diameter in edges?',
          a: 'If left has height L nodes and right has R nodes, the path down-left and down-right uses L + R edges (one edge per node below the bend). It keeps the code simple; just be clear about it out loud.',
        },
        {
          q: 'What other problems use "return one thing, record another"?',
          a: 'Binary Tree Maximum Path Sum (return best single branch, record left + node + right), Balanced Binary Tree (return height, record if unbalanced) and Longest Univalue Path.',
        },
      ],
    },
    {
      id: 'queue-using-stacks',
      title: 'Implement Queue using Stacks',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'queues',
      question: `Implement a first-in-first-out **queue** using only **two stacks**. Support:

- \`push(x)\` — add x to the back
- \`pop()\` — remove and return the front
- \`peek()\` — return the front without removing it
- \`empty()\` — return true if the queue is empty

You may only use stack operations: push to top, pop from top, look at top, size.

\`\`\`javascript
const q = new MyQueue();
q.push(1); q.push(2);
q.peek();  // 1
q.pop();   // 1
q.empty(); // false
\`\`\`

**Goal:** every operation should be **amortized O(1)** (O(1) on average over many calls).`,
      hints: [
        'A stack reverses order. Reversing twice gives the original order back.',
        'Use an `in` stack for pushes and an `out` stack for pops.',
        'Only when `out` is empty, move everything from `in` to `out`. Now the oldest item is on top of `out`.',
      ],
      solution: `**Idea:** a simple version moves all items between the stacks on every pop (O(n) per pop). Better: **two stacks, lazy transfer**. New items go on \`inStack\`. When we need the front and \`outStack\` is empty, pour \`inStack\` into \`outStack\` — this flips the order so the oldest item is on top.

\`\`\`javascript
class MyQueue {
  constructor() {
    this.inStack = [];  // receives new items
    this.outStack = []; // gives items out in queue order
  }

  push(x) {
    this.inStack.push(x);
  }

  // move items only when outStack is empty
  moveIfNeeded() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
  }

  pop() {
    this.moveIfNeeded();
    return this.outStack.pop();
  }

  peek() {
    this.moveIfNeeded();
    return this.outStack[this.outStack.length - 1];
  }

  empty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}

const q = new MyQueue();
q.push(1); q.push(2);
console.log(q.peek(), q.pop(), q.empty()); // 1 1 false
\`\`\`

**Dry run:** push 1, push 2 → in = [1, 2]. peek: out is empty, move → out = [2, 1], top is **1**. pop → 1, out = [2]. push 3 → in = [3]. pop → out not empty → 2. pop → out empty, move → out = [3] → 3.

**Complexity:** push O(1). pop/peek **amortized O(1)**: each item is moved from in to out at most once in its life. Space O(n).`,
      followUps: [
        {
          q: 'What does "amortized O(1)" mean here?',
          a: 'One single pop can cost O(n) when it moves many items, but each item is moved only once. So n operations cost O(n) in total, which is O(1) on average per operation.',
        },
        {
          q: 'Why not just use array.shift() in JavaScript?',
          a: '`shift()` re-indexes the whole array, so it is O(n). For a real queue in JS use two stacks, a head index, or a linked list.',
        },
        {
          q: 'Can you implement a stack using queues?',
          a: 'Yes, with one queue: after pushing x, rotate the queue size - 1 times (dequeue and enqueue) so x is at the front. Push becomes O(n), pop O(1).',
        },
      ],
    },
    {
      id: 'sqrt-x',
      title: 'Sqrt(x) without Math.sqrt',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'binary-search',
      question: `Given a non-negative integer \`x\`, return the square root of \`x\` **rounded down** to the nearest integer. You may **not** use \`Math.sqrt\` or \`**\` / \`Math.pow\`.

\`\`\`text
Input: x = 4   Output: 2
Input: x = 8   Output: 2   (real root is 2.828..., rounded down)
Input: x = 0   Output: 0
\`\`\`

**Constraints:** 0 ≤ x ≤ 2³¹ - 1.`,
      hints: [
        'Brute force: try 1, 2, 3, ... until i * i > x. That is O(√x). Can you search faster?',
        'The answer is somewhere in 0..x, and "m * m <= x" is true for small m and false for big m. That is a sorted yes/no shape — binary search!',
        'Binary search for the **largest** m with m * m <= x. When mid * mid <= x, save mid as a candidate and search right.',
      ],
      solution: `**Idea:** brute force counts up from 1 (O(√x)). Optimal: **binary search on the answer**. We are not searching an array; we are searching the range of possible answers \`0..x\` for the biggest \`m\` where \`m * m <= x\`.

\`\`\`javascript
function mySqrt(x) {
  if (x < 2) return x;           // 0 -> 0, 1 -> 1

  let low = 1;
  let high = Math.floor(x / 2);  // for x >= 2, the root is at most x / 2
  let answer = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (mid * mid <= x) {
      answer = mid;     // mid works, but maybe a bigger value works too
      low = mid + 1;
    } else {
      high = mid - 1;   // mid is too big
    }
  }
  return answer;
}

console.log(mySqrt(8));          // 2
console.log(mySqrt(2147483647)); // 46340
\`\`\`

**Dry run** for x = 8: low 1, high 4. mid 2: 4 <= 8 → answer 2, low 3. mid 3: 9 > 8 → high 2. Stop. Answer **2**.

**Complexity:** O(log x) time, O(1) space.

**Note:** in JavaScript, \`mid * mid\` is safe here because numbers are exact up to about 9 × 10¹⁵. In Java or C++ you would compare \`mid <= x / mid\` to avoid integer overflow.`,
      followUps: [
        {
          q: 'How would you return the root to 3 decimal places?',
          a: 'Binary search on decimals: keep `low` and `high` as floats and loop while `high - low > 0.0001`. Or use Newton\'s method: `r = (r + x / r) / 2`, which converges very fast.',
        },
        {
          q: 'What other problems use "binary search on the answer"?',
          a: 'Koko Eating Bananas, Capacity to Ship Packages Within D Days and Split Array Largest Sum. The pattern: the answer is a number in a range and you can check "is this value good enough?".',
        },
      ],
    },
    // ──────────────────────────── MEDIUM ────────────────────────────
    {
      id: 'rotate-array',
      title: 'Rotate Array by k Steps',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'arrays',
      question: `Rotate the array \`nums\` to the **right** by \`k\` steps, **in place**. Each step moves the last item to the front.

\`\`\`text
Input:  nums = [1, 2, 3, 4, 5, 6, 7], k = 3
Output: [5, 6, 7, 1, 2, 3, 4]

Input:  nums = [-1, -100, 3, 99], k = 2
Output: [3, 99, -1, -100]
\`\`\`

**Constraints:** 1 ≤ nums.length ≤ 100,000. 0 ≤ k ≤ 100,000 (k can be bigger than the length). Try for O(1) extra space.`,
      hints: [
        'Rotating by the array length gives the same array, so first do `k = k % n`.',
        'Brute force moves one item at a time, k times: O(n · k). An extra array works in O(n) but uses O(n) space.',
        'Reverse trick: reverse the whole array, then reverse the first k items, then reverse the rest.',
      ],
      solution: `**Idea:** brute force rotates one step at a time (O(n · k)), or copies into a new array (O(n) space). Optimal: the **three reverses** trick. Reversing the whole array puts the last k items at the front, but backwards. Reversing each part again fixes the order inside each part.

\`\`\`javascript
function rotate(nums, k) {
  const n = nums.length;
  k = k % n; // rotating n times = no change

  reverse(nums, 0, n - 1); // [7,6,5,4,3,2,1]
  reverse(nums, 0, k - 1); // [5,6,7,4,3,2,1]
  reverse(nums, k, n - 1); // [5,6,7,1,2,3,4]
}

// reverse nums between index left and right (both included)
function reverse(nums, left, right) {
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]]; // swap
    left++;
    right--;
  }
}

const a = [1, 2, 3, 4, 5, 6, 7];
rotate(a, 3);
console.log(a); // [5, 6, 7, 1, 2, 3, 4]
\`\`\`

**Dry run:** shown in the comments above, for k = 3.

**Complexity:** O(n) time (each item is swapped about twice), O(1) space.

**Edge cases:** k = 0 or k = n → no change. k > n (like k = 3 for \`[1, 2]\`) → \`k % n\` = 1. One item → nothing changes.`,
      followUps: [
        {
          q: 'How would you rotate LEFT by k?',
          a: 'Left by k is the same as right by `n - k`. Or swap the order of the reverses: reverse the first k, reverse the rest, then reverse the whole array.',
        },
        {
          q: 'Is `nums.unshift(...nums.splice(-k))` OK?',
          a: 'It gives the right answer and is fine in real code, but it creates a temporary array (O(k) space) and `unshift` shifts every item. Interviewers usually want the in-place reverse trick.',
        },
      ],
    },
    {
      id: 'sort-colors',
      title: 'Sort Colors (Dutch National Flag)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'two-pointers',
      question: `An array \`nums\` has only the values \`0\`, \`1\` and \`2\` (red, white, blue). Sort it **in place** so all 0s come first, then 1s, then 2s. Do **not** use the built-in sort.

\`\`\`text
Input:  [2, 0, 2, 1, 1, 0]
Output: [0, 0, 1, 1, 2, 2]

Input:  [2, 0, 1]
Output: [0, 1, 2]
\`\`\`

**Constraints:** 1 ≤ n ≤ 300. **Follow-up:** one pass, O(1) extra space.`,
      hints: [
        'Two-pass version: count the 0s, 1s and 2s, then overwrite the array.',
        'One pass: keep three zones — 0s on the left, 2s on the right, 1s in the middle.',
        'Pointers `low`, `mid`, `high`. nums[mid] is 0 → swap with low, move both. 1 → just move mid. 2 → swap with high, move high only (the new value at mid is not checked yet).',
      ],
      solution: `**Idea:** simple version is "counting sort": count each color, then rewrite (two passes). Optimal one pass: **Dutch National Flag** with three pointers.

- Everything before \`low\` is 0.
- Everything after \`high\` is 2.
- \`mid\` scans the unknown part between them.

\`\`\`javascript
function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;

  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]]; // send 0 to the left zone
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;                                             // 1 stays in the middle
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]]; // send 2 to the right zone
      high--;      // do NOT move mid: the swapped-in value is still unchecked
    }
  }
}

const a = [2, 0, 2, 1, 1, 0];
sortColors(a);
console.log(a); // [0, 0, 1, 1, 2, 2]
\`\`\`

**Dry run** for \`[2, 0, 1]\`: mid 0 is 2 → swap with high → \`[1, 0, 2]\`, high 1. mid 0 is 1 → mid 1. mid 1 is 0 → swap with low 0 → \`[0, 1, 2]\`, low 1, mid 2. mid > high → stop.

**Complexity:** O(n) time, one pass, O(1) space.

**Common bug:** moving \`mid\` after swapping with \`high\`. The value that came from the right has not been looked at yet.`,
      followUps: [
        {
          q: 'Why can we move mid after swapping with low?',
          a: 'Everything between low and mid was already checked and is 1 (or low equals mid). So the value swapped in from low is a 1 (or the same 0), which is safe to pass.',
        },
        {
          q: 'Where is this 3-way partition used in real life?',
          a: 'Quick sort with many duplicates uses a 3-way partition (less than / equal / greater than the pivot), so equal values are not sorted again.',
        },
      ],
    },
    {
      id: 'longest-palindromic-substring',
      title: 'Longest Palindromic Substring',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'two-pointers',
      question: `Given a string \`s\`, return the **longest substring** that is a palindrome (reads the same forwards and backwards). A substring is a continuous part of the string.

\`\`\`text
Input:  "babad"   Output: "bab"   ("aba" is also correct)
Input:  "cbbd"    Output: "bb"
Input:  "a"       Output: "a"
\`\`\`

**Constraints:** 1 ≤ s.length ≤ 1000.`,
      hints: [
        'Brute force checks every substring (O(n²) of them) and each check is O(n): O(n³) total.',
        'Every palindrome has a center. Grow outwards from the center while both sides match.',
        'There are 2n - 1 centers: each character (odd length, like "aba") and each gap between two characters (even length, like "abba").',
      ],
      solution: `**Idea:** brute force tests every substring: O(n³). Optimal for interviews: **expand around center**. Two pointers start at a center and move outwards while the characters match. Try every center, both odd and even.

\`\`\`javascript
function longestPalindrome(s) {
  let start = 0;   // where the best palindrome starts
  let maxLen = 0;  // its length

  // grow from (left, right) while it is still a palindrome
  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    // loop stopped one step too far on both sides
    const len = right - left - 1;
    if (len > maxLen) {
      maxLen = len;
      start = left + 1;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // odd length, center is one char ("aba")
    expand(i, i + 1); // even length, center is a gap ("abba")
  }

  return s.slice(start, start + maxLen);
}

console.log(longestPalindrome('babad')); // "bab"
console.log(longestPalindrome('cbbd'));  // "bb"
\`\`\`

**Dry run** for \`"cbbd"\`: center 0 → "c" (len 1). Gap 1-2: s[1] = s[2] = "b" → grow → s[0] "c" ≠ s[3] "d" → stop, len 2, "bb". No other center beats 2 → **"bb"**.

**Complexity:** O(n²) time (n centers, each expands up to n). O(1) extra space.

**Edge cases:** one character returns itself. All same characters ("aaaa") returns the whole string.`,
      followUps: [
        {
          q: 'Is there a DP solution?',
          a: 'Yes: `dp[i][j]` is true if s[i] === s[j] and dp[i+1][j-1] is true. It is also O(n²) time but uses O(n²) memory, so expand-around-center is better.',
        },
        {
          q: 'Can it be done in O(n)?',
          a: 'Yes, with Manacher\'s algorithm, but it is rarely expected. Mention that it exists and explain the O(n²) solution well.',
        },
        {
          q: 'How would you COUNT all palindromic substrings?',
          a: 'Same expand-around-center loop, but add 1 to a counter every time the while loop finds a match, instead of tracking the longest.',
        },
      ],
    },
    {
      id: 'find-all-anagrams',
      title: 'Find All Anagrams in a String',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'sliding-window-problems',
      question: `Given strings \`s\` and \`p\`, return the **start indexes** of every substring of \`s\` that is an **anagram** of \`p\` (same letters, any order).

\`\`\`text
Input:  s = "cbaebabacd", p = "abc"
Output: [0, 6]     ("cba" at 0, "bac" at 6)

Input:  s = "abab", p = "ab"
Output: [0, 1, 2]  ("ab", "ba", "ab")
\`\`\`

**Constraints:** 1 ≤ s.length, p.length ≤ 30,000. Lowercase English letters only.`,
      hints: [
        'Every answer is a window of exactly p.length characters. That is a **fixed-size sliding window**.',
        'Keep letter counts for p and for the current window. Two strings are anagrams when their counts are equal.',
        'When the window slides, add the new right letter and remove the left letter that falls out. Compare the two 26-length count arrays (O(26) per step).',
      ],
      solution: `**Idea:** brute force sorts every window of length m and compares it with sorted p: O(n · m log m). Optimal: a **fixed-size sliding window** with two count arrays of 26 letters. Sliding by one only changes two counts, so each step is cheap.

\`\`\`javascript
function findAnagrams(s, p) {
  const result = [];
  const m = p.length;
  if (m > s.length) return result;

  const need = new Array(26).fill(0);   // letter counts of p
  const window = new Array(26).fill(0); // letter counts of the current window
  const code = (ch) => ch.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, ...

  for (const ch of p) need[code(ch)]++;

  for (let right = 0; right < s.length; right++) {
    window[code(s[right])]++;            // add the new letter on the right

    if (right >= m) {
      window[code(s[right - m])]--;      // remove the letter that left the window
    }

    // window is full size: compare counts
    if (right >= m - 1 && sameCounts(need, window)) {
      result.push(right - m + 1);        // start index of this window
    }
  }
  return result;
}

function sameCounts(a, b) {
  for (let i = 0; i < 26; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

console.log(findAnagrams('cbaebabacd', 'abc')); // [0, 6]
console.log(findAnagrams('abab', 'ab'));        // [0, 1, 2]
\`\`\`

**Dry run** for \`"abab"\`, p = \`"ab"\`: window "ab" (right 1) matches → 0. Slide: add "a", drop "a" → "ba" matches → 1. Slide: add "b", drop "b" → "ab" → 2.

**Complexity:** O(26 · n) = O(n) time. O(1) space (two arrays of 26).

**Edge cases:** p longer than s → \`[]\`. Repeated letters ("aaaa", "aa") work because we compare counts, not sets.`,
      followUps: [
        {
          q: 'How do you avoid comparing 26 numbers on every step?',
          a: 'Keep a `matches` counter of how many letters have equal counts. When a count changes, update `matches` for just that letter. The window is an anagram when `matches === 26`.',
        },
        {
          q: 'How is "Permutation in String" different?',
          a: 'It asks only true/false: does s contain any permutation of p? Same code, but return true at the first match.',
        },
      ],
    },
    {
      id: 'evaluate-rpn',
      title: 'Evaluate Reverse Polish Notation',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'stack-problems',
      question: `Evaluate an expression written in **Reverse Polish Notation** (RPN). In RPN the operator comes **after** its two numbers: \`2 1 +\` means 2 + 1. The input is an array of tokens. Operators are \`+\`, \`-\`, \`*\`, \`/\`. Division **truncates toward zero** (so -7 / 2 = -3).

\`\`\`text
Input:  ["2", "1", "+", "3", "*"]
Output: 9            ((2 + 1) * 3)

Input:  ["4", "13", "5", "/", "+"]
Output: 6            (4 + (13 / 5) = 4 + 2)
\`\`\`

**Constraints:** 1 to 10,000 tokens. The expression is always valid. No division by zero.`,
      hints: [
        'When you see an operator, it works on the two most recent numbers. "Most recent" = a stack.',
        'Push numbers. On an operator, pop two numbers, apply it, and push the result.',
        'Order matters for - and /: the first pop is the RIGHT number, the second pop is the LEFT number. Use Math.trunc for division.',
      ],
      solution: `**Idea:** RPN was designed for stacks. Numbers go on the stack. An operator pops the top two numbers, calculates, and pushes the answer back. At the end one number is left: the result.

\`\`\`javascript
function evalRPN(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const right = stack.pop(); // popped first = right side
      const left = stack.pop();

      if (token === '+') stack.push(left + right);
      else if (token === '-') stack.push(left - right);
      else if (token === '*') stack.push(left * right);
      else stack.push(Math.trunc(left / right)); // truncate toward zero
    } else {
      stack.push(Number(token)); // "-11" becomes -11
    }
  }
  return stack.pop();
}

console.log(evalRPN(['2', '1', '+', '3', '*']));  // 9
console.log(evalRPN(['4', '13', '5', '/', '+'])); // 6
\`\`\`

**Dry run** for \`["4","13","5","/","+"]\`: push 4, 13, 5 → \`[4, 13, 5]\`. "/" → 13 / 5 = 2.6 → trunc 2 → \`[4, 2]\`. "+" → 6. Answer **6**.

**Complexity:** O(n) time, O(n) space for the stack.

**Edge cases:**

- Negative numbers like \`"-11"\`: do not treat a token as an operator just because it starts with "-". Compare the full token.
- \`Math.floor(-7 / 2)\` is -4, but the rule says -3, so use \`Math.trunc\`.`,
      followUps: [
        {
          q: 'How would you make it easy to add new operators?',
          a: 'Use a lookup object: `const ops = { \'+\': (a, b) => a + b, ... }`. Then `if (token in ops) stack.push(ops[token](left, right))`. This is the Open/Closed idea: add entries, not if-branches.',
        },
        {
          q: 'How would you evaluate a normal expression like "3 + 4 * 2"?',
          a: 'Convert it to RPN first with the Shunting Yard algorithm (an operator stack that respects precedence), or use two stacks (numbers and operators) as in "Basic Calculator II".',
        },
      ],
    },
    {
      id: 'decode-string',
      title: 'Decode String',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'stacks',
      question: `Decode an encoded string. The rule is \`k[text]\`: repeat \`text\` exactly \`k\` times. Brackets can be **nested**.

\`\`\`text
Input:  "3[a]2[bc]"       Output: "aaabcbc"
Input:  "3[a2[c]]"        Output: "accaccacc"
Input:  "2[abc]3[cd]ef"   Output: "abcabccdcdcdef"
\`\`\`

**Constraints:** up to 30 characters of input; k is a positive integer (it can have more than one digit, like \`10[a]\`). The input is always valid.`,
      hints: [
        'Nested brackets mean you must "pause" the outer string, decode the inner one, then come back. Pausing and resuming = a stack.',
        'On "[": push the current string and the current number, then start fresh.',
        'On "]": pop the previous string and the number k, then set current = previous + current repeated k times.',
      ],
      solution: `**Idea:** use a **stack** to remember the outer context. When a bracket opens, save "what I had built so far" and "how many times to repeat". When it closes, take them back and glue the repeated inner part on.

\`\`\`javascript
function decodeString(s) {
  const stack = [];   // items: [previousString, repeatCount]
  let current = '';   // string being built at this bracket level
  let num = 0;        // number being read (can be several digits)

  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);      // "12" -> 1, then 12
    } else if (ch === '[') {
      stack.push([current, num]);       // pause this level
      current = '';
      num = 0;
    } else if (ch === ']') {
      const [prev, times] = stack.pop(); // resume the outer level
      current = prev + current.repeat(times);
    } else {
      current += ch;                    // a normal letter
    }
  }
  return current;
}

console.log(decodeString('3[a2[c]]')); // "accaccacc"
console.log(decodeString('3[a]2[bc]')); // "aaabcbc"
\`\`\`

**Dry run** for \`"3[a2[c]]"\`:

- "3" → num 3. "[" → push ["", 3], current "".
- "a" → current "a". "2" → num 2. "[" → push ["a", 2], current "".
- "c" → current "c".
- "]" → pop ["a", 2] → current = "a" + "cc" = "acc".
- "]" → pop ["", 3] → current = "" + "acc" × 3 = **"accaccacc"**.

**Complexity:** O(output length) time and space — the output can be much longer than the input.

**Edge cases:** no brackets ("abc") → returned as is. Multi-digit numbers ("10[a]") → handled by \`num * 10 + digit\`.`,
      followUps: [
        {
          q: 'Can you solve it with recursion instead of a stack?',
          a: 'Yes. A function `decode(i)` reads until it hits "]" and returns the decoded string plus the index where it stopped. On "[" it calls itself for the inner part. The call stack replaces your manual stack.',
        },
        {
          q: 'What could go wrong with a very large k?',
          a: 'The output can explode in size (e.g. "1000[1000[a]]" is a million characters). In production you would set a max output length and stop early.',
        },
      ],
    },
    {
      id: 'remove-nth-from-end',
      title: 'Remove Nth Node From End of List',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'linked-list-problems',
      question: `Given the \`head\` of a linked list, remove the \`n\`-th node **from the end** and return the head.

\`\`\`text
Input:  1 -> 2 -> 3 -> 4 -> 5, n = 2
Output: 1 -> 2 -> 3 -> 5        (4 was 2nd from the end)

Input:  1, n = 1
Output: (empty list)

Input:  1 -> 2, n = 2
Output: 2                        (removing the head)
\`\`\`

**Constraints:** 1 ≤ n ≤ list length ≤ 30. **Follow-up:** do it in one pass.`,
      hints: [
        'Two-pass version: count the length L, then remove node number L - n from the start.',
        'One pass: start two pointers n nodes apart. When the front one reaches the end, the back one is just before the node to remove.',
        'Use a dummy node before the head. Then removing the head is not a special case.',
      ],
      solution: `**Idea:** two-pass version counts the length first. Optimal one pass: **two pointers with a gap of n**. Move \`fast\` n steps ahead, then move both together. When \`fast\` is at the last node, \`slow\` is right before the node to delete. A **dummy node** (a fake node placed before head) handles "delete the head" without extra if-checks.

\`\`\`javascript
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head); // fake node before head
  let fast = dummy;
  let slow = dummy;

  // 1. move fast n steps ahead
  for (let i = 0; i < n; i++) {
    fast = fast.next;
  }

  // 2. move both until fast is on the LAST node
  while (fast.next !== null) {
    fast = fast.next;
    slow = slow.next;
  }

  // 3. slow.next is the node to remove: skip over it
  slow.next = slow.next.next;

  return dummy.next; // the head may have changed
}
\`\`\`

**Dry run** for \`1-2-3-4-5\`, n = 2: fast moves 2 steps → node 2. Move both: (fast 3, slow 1), (fast 4, slow 2), (fast 5, slow 3). fast.next is null → stop. slow is 3, so skip 4 → \`1-2-3-5\`.

**Complexity:** O(L) time, one pass. O(1) space.

**Edge cases:** single node → returns null. n equals the length → the head is removed; the dummy node makes this work.`,
      followUps: [
        {
          q: 'Why use a dummy node?',
          a: 'Without it, deleting the head needs special code because there is no node before it. The dummy gives every real node a "previous" node, so one rule works for all cases.',
        },
        {
          q: 'What if n could be bigger than the length?',
          a: 'Check while moving fast ahead: if fast becomes null before n steps, return head unchanged (or throw an error), depending on what the interviewer wants.',
        },
      ],
    },
    {
      id: 'add-two-numbers',
      title: 'Add Two Numbers (linked lists)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'linked-lists',
      question: `Two non-negative numbers are stored as linked lists. The digits are in **reverse order** (the ones digit first). Add the two numbers and return the sum as a linked list in the same format.

\`\`\`text
Input:  l1 = 2 -> 4 -> 3   (342)
        l2 = 5 -> 6 -> 4   (465)
Output: 7 -> 0 -> 8        (807)

Input:  l1 = 9 -> 9 -> 9 -> 9 -> 9 -> 9 -> 9,  l2 = 9 -> 9 -> 9 -> 9
Output: 8 -> 9 -> 9 -> 9 -> 0 -> 0 -> 0 -> 1
\`\`\`

**Constraints:** each list has 1 to 100 nodes. No leading zeros except the number 0.`,
      hints: [
        'Do not convert to numbers: 100 digits is too big. Add digit by digit like on paper.',
        'Reverse order is a gift: the ones digits come first, which is exactly where school addition starts.',
        'Loop while l1 or l2 or carry is left. digit = sum % 10, carry = Math.floor(sum / 10). Build the result after a dummy node.',
      ],
      solution: `**Idea:** brute force turns the lists into numbers, adds them and builds a new list — this breaks for big numbers. Optimal: **school addition with a carry**, walking both lists together. A shorter list just gives 0 for its missing digits.

\`\`\`javascript
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0); // result starts after this fake node
  let tail = dummy;
  let carry = 0;

  // keep going while there are digits OR a carry left
  while (l1 !== null || l2 !== null || carry !== 0) {
    const a = l1 ? l1.val : 0;
    const b = l2 ? l2.val : 0;
    const sum = a + b + carry;

    carry = Math.floor(sum / 10);       // 15 -> carry 1
    tail.next = new ListNode(sum % 10); // 15 -> digit 5
    tail = tail.next;

    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}
\`\`\`

**Dry run** for 342 + 465 (\`2-4-3\` + \`5-6-4\`): 2 + 5 = 7 → 7, carry 0. 4 + 6 = 10 → 0, carry 1. 3 + 4 + 1 = 8 → 8. Result \`7-0-8\`.

**Complexity:** O(max(m, n)) time. O(max(m, n)) space for the new list.

**Edge cases:** different lengths (missing digits count as 0). A final carry like 5 + 5 = 10 → \`0-1\`, which is why the loop also checks \`carry !== 0\`.`,
      followUps: [
        {
          q: 'What if the digits are stored in normal order (most significant first)?',
          a: 'Push the digits of each list onto two stacks, then pop and add (pops give you the ones digit first). Build the result by adding each new node at the front. Or reverse both lists first.',
        },
        {
          q: 'Why does this matter for a MERN developer?',
          a: 'Money and IDs can be larger than Number.MAX_SAFE_INTEGER. The same digit-by-digit idea is what BigInt or decimal libraries do inside.',
        },
      ],
    },
    {
      id: 'right-side-view',
      title: 'Binary Tree Right Side View',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'tree-problems-bfs-bst',
      question: `Imagine standing on the **right side** of a binary tree. Return the values of the nodes you can see, from top to bottom.

\`\`\`text
       1          <- see 1
      / \\
     2   3        <- see 3
      \\   \\
       5   4      <- see 4

Output: [1, 3, 4]
\`\`\`

\`\`\`text
Input: [1, 2, 3, 4]  ->  [1, 3, 4]   (4 is on the left, but nothing hides it)
Input: []            ->  []
\`\`\`

**Constraints:** 0 to 100 nodes.`,
      hints: [
        'You see exactly one node per level: the last one when the level is read left to right.',
        'Level order traversal (BFS with a queue) processes one level at a time.',
        'For each level, loop over the current queue size; the node at index size - 1 is the visible one.',
      ],
      solution: `**Idea:** do a **level-order BFS**. For each level, the **rightmost** node is the one you can see. A common wrong answer is "just follow the right children" — that fails when a left branch is deeper (see \`[1, 2, 3, 4]\`).

\`\`\`javascript
function rightSideView(root) {
  const result = [];
  if (root === null) return result;

  let queue = [root];

  while (queue.length > 0) {
    // the last node of this level is visible from the right
    result.push(queue[queue.length - 1].val);

    const nextLevel = [];
    for (const node of queue) {
      if (node.left) nextLevel.push(node.left);
      if (node.right) nextLevel.push(node.right);
    }
    queue = nextLevel; // move down one level
  }
  return result;
}
\`\`\`

**Dry run** for \`[1, 2, 3, null, 5, null, 4]\`: level [1] → see 1. Level [2, 3] → see 3. Level [5, 4] → see 4. Answer \`[1, 3, 4]\`.

**Complexity:** O(n) time, O(w) space where w is the widest level.

**Edge cases:** empty tree → \`[]\`. A tree that only has left children → you see every node.`,
      followUps: [
        {
          q: 'Can you do it with DFS?',
          a: 'Yes. Visit right child first, and pass the depth. The first time you reach a new depth (`depth === result.length`), push that node. It uses O(h) stack space.',
        },
        {
          q: 'How would you return the LEFT side view?',
          a: 'Take the first node of each level instead of the last (or in DFS, visit the left child first).',
        },
      ],
    },
    {
      id: 'kth-smallest-bst',
      title: 'Kth Smallest Element in a BST',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'tree-problems-bfs-bst',
      question: `Given the \`root\` of a **binary search tree** (BST) and a number \`k\`, return the \`k\`-th smallest value (1-indexed).

In a BST, every value in the left subtree is smaller than the node, and every value in the right subtree is bigger.

\`\`\`text
        5
       / \\
      3   6
     / \\
    2   4
   /
  1

k = 3  ->  3     (sorted: 1, 2, 3, 4, 5, 6)
\`\`\`

**Constraints:** 1 ≤ k ≤ number of nodes ≤ 10,000.`,
      hints: [
        'Simple version: collect all values, sort, return index k - 1. But you are not using the BST property.',
        'In-order traversal (left, node, right) of a BST visits values in sorted order.',
        'Do an in-order traversal with a counter and stop as soon as you have visited k nodes.',
      ],
      solution: `**Idea:** brute force collects every value and sorts (O(n log n)). Optimal: **in-order traversal** already gives sorted order in a BST. Count nodes as you visit them and stop at the k-th. Using an explicit stack makes stopping early easy.

\`\`\`javascript
function kthSmallest(root, k) {
  const stack = [];
  let node = root;

  while (node !== null || stack.length > 0) {
    // go as far left as possible (smallest values first)
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }

    node = stack.pop();  // next smallest value
    k--;
    if (k === 0) return node.val;

    node = node.right;   // then visit the right subtree
  }
  return -1; // only if k is larger than the tree size
}
\`\`\`

**Dry run** (k = 3) on the tree above: go left 5 → 3 → 2 → 1. Pop 1 (k = 2). Pop 2 (k = 1). Pop 3 (k = 0) → return **3**.

**Complexity:** O(h + k) time — we walk down the height once and then visit k nodes. O(h) space for the stack.

**Edge cases:** k = 1 → the leftmost node. k = n → the largest (rightmost) node.`,
      followUps: [
        {
          q: 'What if the BST is changed often and you need kth smallest many times?',
          a: 'Store the size of each subtree in every node. Then at each node: if k <= leftSize go left; if k === leftSize + 1 it is this node; else go right with k - leftSize - 1. That is O(h) per query.',
        },
        {
          q: 'How would you find the kth LARGEST?',
          a: 'Do a reverse in-order traversal (right, node, left) and count the same way.',
        },
      ],
    },
    {
      id: 'rotting-oranges',
      title: 'Rotting Oranges',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'graph-problems',
      question: `You get a grid where each cell is:

- \`0\` — empty
- \`1\` — fresh orange
- \`2\` — rotten orange

Every minute, each rotten orange makes its fresh neighbours (up, down, left, right) rotten. Return the **minimum minutes** until no fresh orange is left. If that is impossible, return \`-1\`.

\`\`\`text
Input:  [[2,1,1],
         [1,1,0],
         [0,1,1]]
Output: 4

Input:  [[2,1,1],
         [0,1,1],
         [1,0,1]]
Output: -1   (the bottom-left orange can never be reached)

Input:  [[0,2]]
Output: 0    (no fresh oranges at the start)
\`\`\`

**Constraints:** grid is up to 10 × 10.`,
      hints: [
        'Rot spreads one step per minute in all directions at once. "One step at a time, level by level" = BFS.',
        'Start the BFS from ALL rotten oranges at the same time (multi-source BFS): put them all in the queue first.',
        'Count fresh oranges at the start. Each BFS level is one minute. At the end, if fresh > 0 return -1.',
      ],
      solution: `**Idea:** brute force simulates minute by minute, scanning the whole grid each time (O((rows·cols)²)). Optimal: **multi-source BFS**. All rotten oranges start in the queue together. Each BFS level = one minute. Count fresh oranges so we know if some were never reached.

\`\`\`javascript
function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let queue = [];
  let fresh = 0;

  // 1. find all rotten oranges and count the fresh ones
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;

  // 2. BFS level by level, only while there is still something to rot
  while (queue.length > 0 && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // rot it now so it is not added twice
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++; // one full level = one minute
  }

  return fresh === 0 ? minutes : -1;
}

console.log(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]])); // 4
\`\`\`

**Dry run** for the first grid: fresh = 6. Minute 1: (0,1), (1,0) rot. Minute 2: (0,2), (1,1). Minute 3: (2,1). Minute 4: (2,2). fresh = 0 → **4**.

**Complexity:** O(rows × cols) time and space — each cell enters the queue at most once.

**Edge cases:** no fresh oranges → 0 (the loop never runs). A fresh orange with no rotten one anywhere → -1. Note: this changes the input grid; copy it first if the caller needs it.`,
      followUps: [
        {
          q: 'Why BFS and not DFS?',
          a: 'BFS explores in "rings" of equal distance, so the level number is the time. DFS goes deep along one path and does not give the shortest time directly.',
        },
        {
          q: 'What real problems look like multi-source BFS?',
          a: 'Distance from every cell to the nearest hospital/store, "Walls and Gates", "01 Matrix", and spreading updates through a network from several servers at once.',
        },
      ],
    },
    {
      id: 'generate-parentheses',
      title: 'Generate Parentheses',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'backtracking',
      question: `Given \`n\` pairs of parentheses, return **all** combinations of well-formed (valid) parentheses.

\`\`\`text
Input:  n = 3
Output: ["((()))", "(()())", "(())()", "()(())", "()()()"]

Input:  n = 1
Output: ["()"]
\`\`\`

**Constraints:** 1 ≤ n ≤ 8. Any order is fine.`,
      hints: [
        'Brute force: generate all 2^(2n) strings of "(" and ")" and keep the valid ones. Too slow. Can you only build valid strings?',
        'Build the string one character at a time (backtracking). Track how many "(" and ")" you have used.',
        'You may add "(" if open < n. You may add ")" only if close < open. When the length is 2n, save it.',
      ],
      solution: `**Idea:** brute force makes every string and filters (O(2^(2n) · n)). Optimal: **backtracking with rules** so we never build an invalid string:

- add \`(\` only if we still have some left (\`open < n\`)
- add \`)\` only if it closes something (\`close < open\`)

\`\`\`javascript
function generateParenthesis(n) {
  const result = [];

  function build(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current); // used all pairs -> a valid answer
      return;
    }
    if (open < n) {
      build(current + '(', open + 1, close);   // choice 1: open a new pair
    }
    if (close < open) {
      build(current + ')', open, close + 1);   // choice 2: close one
    }
  }

  build('', 0, 0);
  return result;
}

console.log(generateParenthesis(3));
// ["((()))", "(()())", "(())()", "()(())", "()()()"]
\`\`\`

**Dry run** (n = 2): "" → "(" → "((" → "(()" → "(())" ✔. Back to "(" → "()" → "()(" → "()()" ✔. Result \`["(())", "()()"]\`.

**Complexity:** the number of answers is the n-th Catalan number (5 for n = 3, 14 for n = 4, 42 for n = 5), about 4ⁿ / n^1.5. Time is that times n to build each string. Space O(n) for the recursion depth (plus the output).

**Why strings and no "undo" step:** \`current + '('\` creates a new string, so each call has its own copy. With an array you would push, recurse, then pop (classic backtracking).`,
      followUps: [
        {
          q: 'How would you check if one given string of parentheses is valid?',
          a: 'Keep a counter: +1 for "(", -1 for ")". If it ever goes below 0, or it is not 0 at the end, the string is invalid. With several bracket types, use a stack (Valid Parentheses).',
        },
        {
          q: 'What is the general backtracking template?',
          a: 'choose → explore (recurse) → un-choose. Add a rule that cuts off branches early (pruning). Here the pruning rules are open < n and close < open.',
        },
      ],
    },
    {
      id: 'word-search',
      title: 'Word Search in a Grid',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'backtracking',
      question: `Given a grid of letters \`board\` and a string \`word\`, return \`true\` if the word can be built from letters of **adjacent** cells (up, down, left, right). The same cell may **not** be used twice in one word.

\`\`\`text
board = [["A","B","C","E"],
         ["S","F","C","S"],
         ["A","D","E","E"]]

word = "ABCCED"  ->  true
word = "SEE"     ->  true
word = "ABCB"    ->  false  (would need to reuse the B)
\`\`\`

**Constraints:** board up to 6 × 6, word length 1 to 15.`,
      hints: [
        'Try every cell as a starting point, then walk to neighbours that match the next letter (DFS).',
        'You must remember which cells are on the current path. Mark a cell as used before going deeper, and unmark it when you come back (backtracking).',
        'A trick to mark: temporarily change `board[r][c]` to "#", then restore it after the recursive calls.',
      ],
      solution: `**Idea:** **DFS + backtracking** from every cell. \`dfs(r, c, i)\` asks: "can I match \`word[i..]\` starting at this cell?" Mark the cell as visited while it is on the path, then restore it so other paths can use it.

\`\`\`javascript
function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c, i) {
    if (i === word.length) return true;                       // matched all letters
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false; // off the board
    if (board[r][c] !== word[i]) return false;                // wrong letter (or used)

    const saved = board[r][c];
    board[r][c] = '#';                                        // mark as used

    const found =
      dfs(r + 1, c, i + 1) ||
      dfs(r - 1, c, i + 1) ||
      dfs(r, c + 1, i + 1) ||
      dfs(r, c - 1, i + 1);

    board[r][c] = saved;                                      // un-mark (backtrack)
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}

const board = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];
console.log(exist(board, 'ABCCED')); // true
console.log(exist(board, 'ABCB'));   // false
\`\`\`

**Dry run** for "ABCB": start at A(0,0) → B(0,1) → C(0,2) → next must be B. The only B neighbour is (0,1), but it is marked "#" → dead end. Other paths fail too → **false**.

**Complexity:** O(rows · cols · 3^L) time, where L is the word length (after the first step each cell has at most 3 new directions). O(L) space for the recursion.

**Edge cases:** the board is restored after every search, so calling \`exist\` again on the same board still works.`,
      followUps: [
        {
          q: 'How can you make it faster in practice?',
          a: 'Quick checks first: if the word is longer than the board, or the board does not have enough of some letter, return false. Also, if the last letter is rarer than the first, search the reversed word.',
        },
        {
          q: 'What if you must find many words at once (Word Search II)?',
          a: 'Put all words in a Trie and run one DFS per cell that follows the Trie. Searching each word separately repeats a lot of work.',
        },
      ],
    },
    {
      id: 'word-break',
      title: 'Word Break',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'dp-problems-1d',
      question: `Given a string \`s\` and a list of words \`wordDict\`, return \`true\` if \`s\` can be split into a sequence of one or more dictionary words. A word can be used many times.

\`\`\`text
Input:  s = "leetcode", wordDict = ["leet", "code"]                     Output: true
Input:  s = "applepenapple", wordDict = ["apple", "pen"]                Output: true
Input:  s = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"] Output: false
\`\`\`

**Constraints:** 1 ≤ s.length ≤ 300. Up to 1000 words, each up to 20 characters.`,
      hints: [
        'Plain recursion tries every first word and recurses on the rest. It repeats the same suffixes again and again (exponential).',
        'Define dp[i] = "can the first i characters be split into words?". dp[0] = true (the empty string).',
        'dp[i] is true if there is some j < i where dp[j] is true AND s.slice(j, i) is in the dictionary. Use a Set for fast lookups.',
      ],
      solution: `**Idea:** brute-force recursion tries every split and is exponential because it solves the same suffix many times. Optimal: **1D dynamic programming**. \`dp[i]\` says whether the prefix of length i can be split. A prefix works if an earlier good prefix is followed by a dictionary word.

\`\`\`javascript
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);               // O(1) lookups
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;                                   // empty prefix is always OK

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      // prefix s[0..j) is OK and s[j..i) is a word -> prefix s[0..i) is OK
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;                                    // one way is enough
      }
    }
  }
  return dp[s.length];
}

console.log(wordBreak('leetcode', ['leet', 'code']));                        // true
console.log(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']));  // false
\`\`\`

**Dry run** for "leetcode": dp[0] = true. dp[4]: j = 0, "leet" is a word → true. dp[8]: j = 4, dp[4] true and "code" is a word → true. Answer **true**.

For "catsandog": dp[3] ("cat") and dp[4] ("cats") are true, dp[7] ("cat"+"sand" or "cats"+"and") is true, but "og" is not a word and no other split reaches index 9 → **false**.

**Complexity:** O(n²) pairs (i, j), and each \`slice\` costs up to O(n), so O(n³) worst case. Space O(n). A common speed-up: only try j where \`i - j\` is at most the longest word length.`,
      followUps: [
        {
          q: 'How would you return all possible sentences (Word Break II)?',
          a: 'Use DFS with memoization: `solve(start)` returns all sentences for the suffix starting at `start`, cached in a Map. The output itself can be exponential, so the memo mainly avoids repeated work.',
        },
        {
          q: 'Can a Trie help?',
          a: 'Yes. From each good index j, walk the Trie along s[j], s[j+1], ... and mark dp[end] true at every word end. You stop as soon as the Trie has no path, which avoids creating many substrings.',
        },
      ],
    },
    {
      id: 'non-overlapping-intervals',
      title: 'Non-overlapping Intervals',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'intervals',
      question: `Given an array of intervals \`[start, end]\`, return the **minimum number of intervals to remove** so the rest do not overlap. Intervals that only touch (like \`[1, 2]\` and \`[2, 3]\`) do **not** overlap.

\`\`\`text
Input:  [[1,2], [2,3], [3,4], [1,3]]
Output: 1      (remove [1,3])

Input:  [[1,2], [1,2], [1,2]]
Output: 2

Input:  [[1,2], [2,3]]
Output: 0
\`\`\`

**Constraints:** up to 100,000 intervals. Values can be negative.`,
      hints: [
        'Flip the question: keep the MAXIMUM number of non-overlapping intervals. Removed = total - kept.',
        'Greedy choice: among overlapping intervals, keep the one that ENDS first. It leaves the most room for the rest.',
        'Sort by end. Walk through; if start >= lastEnd, keep it and update lastEnd; otherwise count it as removed.',
      ],
      solution: `**Idea:** brute force tries every subset of intervals (O(2ⁿ)). Optimal: **greedy, sorted by end time**. Always keep the interval that finishes earliest — this is the classic "activity selection" rule. Every interval that overlaps the last kept one must be removed.

\`\`\`javascript
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0;

  // sort by end time (copy so we do not change the caller's array)
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);

  let removed = 0;
  let lastEnd = sorted[0][1]; // we keep the first interval

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    if (start >= lastEnd) {
      lastEnd = end;  // no overlap: keep it
    } else {
      removed++;      // overlaps the kept one: remove it
    }
  }
  return removed;
}

console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1
\`\`\`

**Dry run:** sorted by end → \`[1,2] [2,3] [1,3] [3,4]\`. Keep [1,2] (lastEnd 2). [2,3]: 2 >= 2 → keep, lastEnd 3. [1,3]: 1 < 3 → remove (1). [3,4]: keep. Answer **1**.

**Complexity:** O(n log n) time for the sort. O(n) space for the sorted copy (O(1) extra if sorting in place is allowed).

**Why sort by end and not start?** An interval that starts early can be very long and block many others. The one that ends first always leaves the most space.`,
      followUps: [
        {
          q: 'How is this related to "Minimum Number of Arrows to Burst Balloons"?',
          a: 'Same greedy: sort by end, shoot an arrow at the end of the first balloon, and skip every balloon that starts before or at that point. The count of arrows = the number of kept groups.',
        },
        {
          q: 'Real-life example?',
          a: 'Booking the most meetings in one room, or picking the most non-clashing ad slots. "Meeting Rooms II" (how many rooms needed) is a different question solved with a min-heap or sorted start/end arrays.',
        },
      ],
    },
    {
      id: 'top-k-frequent-words',
      title: 'Top K Frequent Words',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'heap-problems',
      question: `Given an array of strings \`words\` and a number \`k\`, return the \`k\` most frequent words. Sort the answer by frequency (highest first). If two words have the same frequency, sort them **alphabetically**.

\`\`\`text
Input:  words = ["i","love","leetcode","i","love","coding"], k = 2
Output: ["i", "love"]                    (both appear twice; "i" < "love")

Input:  words = ["the","day","is","sunny","the","the","the","sunny","is","is"], k = 4
Output: ["the", "is", "sunny", "day"]    (4, 3, 2, 1 times)
\`\`\`

**Constraints:** 1 to 500 words. k is between 1 and the number of unique words.`,
      hints: [
        'First count the words with a Map.',
        'Then order the unique words with a comparator: higher count first; for equal counts, alphabetical order (compare with `<`).',
        'Sorting all unique words is O(m log m). For O(m log k), keep a min-heap of size k with the "worst" word on top.',
      ],
      solution: `**Idea:** count with a Map, then sort unique words with a **two-level comparator**: count descending, then word ascending. This is simple and fast enough for interviews; mention the heap version as the follow-up.

\`\`\`javascript
function topKFrequent(words, k) {
  const counts = new Map();
  for (const w of words) {
    counts.set(w, (counts.get(w) || 0) + 1);
  }

  const unique = [...counts.keys()];

  unique.sort((a, b) => {
    const diff = counts.get(b) - counts.get(a); // higher count first
    if (diff !== 0) return diff;
    return a < b ? -1 : a > b ? 1 : 0;          // same count: alphabetical
  });

  return unique.slice(0, k);
}

console.log(topKFrequent(['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2)); // ["i", "love"]
\`\`\`

**Dry run** for the first example: counts = {i: 2, love: 2, leetcode: 1, coding: 1}. Sorted: i (2), love (2), coding (1), leetcode (1). First 2 → \`["i", "love"]\`.

**Complexity:** O(n) to count + O(m log m) to sort, where m is the number of unique words. Space O(m).

**Note:** we compare with \`<\` instead of \`localeCompare\` because LeetCode-style "alphabetical" means plain character-code order. \`localeCompare\` can order upper/lower case differently.`,
      followUps: [
        {
          q: 'How does the heap version work?',
          a: 'Keep a min-heap of size k ordered so the "weakest" word is on top (lowest count; for ties, the alphabetically LATER word). Push each word; if size > k, pop. At the end pop all and reverse. Time O(m log k).',
        },
        {
          q: 'Can you do better than O(m log m) without a heap?',
          a: 'Bucket sort: an array where index = count, holding the words with that count. Walk from the highest count down, sort each small bucket alphabetically, and collect k words.',
        },
      ],
    },
    // ───────────────────────────── HARD ─────────────────────────────
    {
      id: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'two-pointers',
      question: `You get an array \`height\` of non-negative numbers. Each number is the height of a bar of width 1. After it rains, how much water is **trapped** between the bars?

\`\`\`text
Input:  [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
\`\`\`

\`\`\`text
Small picture for [3, 0, 2, 0, 4]   (# = bar, ~ = water)

        #
#~~~~~~~#
#~~~#~~~#
#~~~#~~~#
3 0 2 0 4    ->  water = 3 + 1 + 3 = 7
\`\`\`

\`\`\`text
Input:  [4,2,0,3,2,5]   Output: 9
Input:  [1,2,3]         Output: 0   (no dip, water runs off)
\`\`\`

**Constraints:** 0 ≤ n ≤ 20,000, 0 ≤ height[i] ≤ 100,000.`,
      hints: [
        'Water above bar i = min(tallest bar on its left, tallest bar on its right) - height[i]. (Never negative.)',
        'Brute force finds the left max and right max for every i: O(n²). Precompute leftMax[] and rightMax[] arrays for O(n) time and O(n) space.',
        'O(1) space: two pointers from both ends. Move the side with the SMALLER max — that side\'s water level is already decided by its own max.',
      ],
      solution: `**Idea:** the water on top of a bar depends on the **shorter** of the tallest wall on its left and the tallest wall on its right.

- Brute force: for each bar scan left and right for the max → O(n²).
- Better: two arrays \`leftMax\` and \`rightMax\` → O(n) time, O(n) space.
- Optimal: **two pointers**. Keep \`leftMax\` and \`rightMax\` as we go. If \`leftMax < rightMax\`, the left bar's water is limited by \`leftMax\` for sure (there is a taller wall somewhere on the right), so we can settle it and move left inward. Otherwise settle the right side.

\`\`\`javascript
function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;   // tallest bar seen from the left so far
  let rightMax = 0;  // tallest bar seen from the right so far
  let water = 0;

  while (left < right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);

    if (leftMax < rightMax) {
      water += leftMax - height[left];   // left side is the limit
      left++;
    } else {
      water += rightMax - height[right]; // right side is the limit
      right--;
    }
  }
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                   // 9
\`\`\`

**Dry run** for \`[4, 2, 0, 3, 2, 5]\`: leftMax 4, rightMax 5 → left side limits.

- i=0: 4 - 4 = 0. i=1: 4 - 2 = 2. i=2: 4 - 0 = 4. i=3: 4 - 3 = 1. i=4: 4 - 2 = 2.
- Total 0 + 2 + 4 + 1 + 2 = **9**.

**Complexity:** O(n) time, O(1) space.

**Edge cases:** empty array or fewer than 3 bars → 0. Strictly rising or falling bars → 0.`,
      followUps: [
        {
          q: 'Can you solve it with a stack?',
          a: 'Yes, with a monotonic decreasing stack of indexes. When a taller bar arrives, pop the bottom of a "dip" and add water = (min(left wall, current) - dip height) × width between the walls. Also O(n).',
        },
        {
          q: 'How is it different from Container With Most Water?',
          a: 'Container picks just TWO lines and ignores bars in between (max area). Trapping Rain Water adds up water above EVERY bar, so bars in between matter.',
        },
        {
          q: 'What about a 2D height map (Trapping Rain Water II)?',
          a: 'Use a min-heap starting from all border cells. Always expand from the lowest wall; neighbours lower than it hold water up to that wall height. O(m·n log(m·n)).',
        },
      ],
    },
    {
      id: 'minimum-window-substring',
      title: 'Minimum Window Substring',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'sliding-window-problems',
      question: `Given strings \`s\` and \`t\`, return the **shortest substring** of \`s\` that contains **every character of t** (including duplicates). If there is none, return \`""\`.

\`\`\`text
Input:  s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"

Input:  s = "a", t = "aa"
Output: ""      (s has only one "a")
\`\`\`

**Constraints:** up to 100,000 characters. Upper and lower case letters. Aim for O(m + n).`,
      hints: [
        'Brute force checks every substring: O(n²) substrings × O(n) check. Use a variable-size sliding window instead.',
        'Expand the right side until the window has everything. Then shrink the left side as much as possible while it is still valid, recording the best.',
        'Keep `need` counts for t and a counter `missing` = t.length. When you add a char whose need is > 0, missing--. The window is valid when missing === 0.',
      ],
      solution: `**Idea:** **variable sliding window**. Grow the window to the right until it covers t. Then shrink from the left while it still covers t — every valid window is a candidate. A single number \`missing\` tells us in O(1) if the window is valid.

\`\`\`javascript
function minWindow(s, t) {
  if (t.length === 0 || t.length > s.length) return '';

  const need = new Map(); // how many more of each char the window needs
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);

  let missing = t.length; // chars of t still not covered
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      if (need.get(ch) > 0) missing--; // this char was really needed
      need.set(ch, need.get(ch) - 1);  // can go negative = extra copies
    }

    // window covers t: shrink from the left as much as possible
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const out = s[left];
      if (need.has(out)) {
        need.set(out, need.get(out) + 1);
        if (need.get(out) > 0) missing++; // we just lost a needed char
      }
      left++;
    }
  }

  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}

console.log(minWindow('ADOBECODEBANC', 'ABC')); // "BANC"
console.log(minWindow('a', 'aa'));              // ""
\`\`\`

**Dry run** (short version) for "ADOBECODEBANC":

- right reaches "C" at index 5 → window "ADOBEC" covers ABC → best 6. Shrink: dropping "A" breaks it.
- right moves on; at index 10 ("A") window "DOBECODEBA" covers again; shrink to "CODEBA" (6).
- right at index 12 ("C") → shrink to **"BANC"** (4). That is the answer.

**Complexity:** O(m + n) time — each pointer moves at most n times. O(k) space for the map (k = distinct chars in t).

**Edge cases:** t longer than s → "". Duplicates in t ("aa") are handled because \`need\` stores counts, not just presence.`,
      followUps: [
        {
          q: 'Why do we let need go negative?',
          a: 'A negative count means the window has EXTRA copies of that char. When shrinking removes one of the extras, the count goes back toward 0 but stays ≤ 0, so `missing` does not change and the window stays valid.',
        },
        {
          q: 'What is the general template for "shortest valid window" problems?',
          a: 'for right in s: add s[right]; while (window is valid) { record answer; remove s[left]; left++ }. For "longest valid window" you flip it: shrink while the window is INVALID, then record.',
        },
      ],
    },
    {
      id: 'sliding-window-maximum',
      title: 'Sliding Window Maximum',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'queues',
      question: `Given an array \`nums\` and a window size \`k\`, a window slides from left to right one step at a time. Return the **maximum** of every window.

\`\`\`text
Input:  nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]

Window            Max
[1  3  -1] ...     3
 1 [3  -1  -3]     3
 1  3 [-1  -3  5]  5
 ...
\`\`\`

**Constraints:** 1 ≤ k ≤ n ≤ 100,000. Values can be negative. Aim for O(n).`,
      hints: [
        'Brute force: compute the max of every window → O(n · k). A max-heap gives O(n log n). Can you get O(n)?',
        'If a newer value is bigger than an older one, the older one can NEVER be a window max again. Throw it away.',
        'Keep a deque (double-ended queue) of indexes with DECREASING values. The front is the max. Remove from the front when it leaves the window; remove from the back while the back is smaller than the new value.',
      ],
      solution: `**Idea:** brute force is O(n · k). Optimal: a **monotonic deque** — a queue of indexes whose values are always in decreasing order.

- Front of the deque = index of the current max.
- Before adding a new value, pop smaller values from the back (they are "useless" now).
- If the front index has slid out of the window, drop it.

In JavaScript, \`array.shift()\` is O(n), so we use a \`head\` index to remove from the front in O(1).

\`\`\`javascript
function maxSlidingWindow(nums, k) {
  const deque = [];  // indexes; values nums[deque[...]] are decreasing
  let head = 0;      // deque front is deque[head]
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    // 1. drop the front if it is outside the window [i - k + 1, i]
    if (head < deque.length && deque[head] <= i - k) {
      head++;
    }
    // 2. drop smaller values from the back: they can never be the max
    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    // 3. add the current index
    deque.push(i);

    // 4. once the first window is full, the front is the max
    if (i >= k - 1) {
      result.push(nums[deque[head]]);
    }
  }
  return result;
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]
\`\`\`

**Dry run** (values shown instead of indexes):

- 1 → [1]. 3 → pop 1 → [3]. -1 → [3, -1] → window full → **3**.
- -3 → [3, -1, -3] → **3**.
- 5 → 3 is out of window; pop -3, -1 → [5] → **5**.
- 3 → [5, 3] → **5**. 6 → pop 3, 5 → [6] → **6**. 7 → [7] → **7**.

**Complexity:** O(n) time — every index is pushed once and removed at most once. O(k) space for the live part of the deque.

**Edge cases:** k = 1 → the array itself. k = n → one value, the overall max.`,
      followUps: [
        {
          q: 'Why do we pop with <= and not <?',
          a: 'If an older value equals the new one, the new one lives longer in the window, so the old one is useless. Using <= keeps the deque smaller. Both are correct.',
        },
        {
          q: 'Where would you use this in a real system?',
          a: 'Rolling metrics: "max response time in the last 60 seconds" or "highest price in the last N trades", updated in O(1) per new event.',
        },
      ],
    },
    {
      id: 'largest-rectangle-histogram',
      title: 'Largest Rectangle in Histogram',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'stack-problems',
      question: `You get an array \`heights\` where each number is the height of a bar of width 1. Return the area of the **largest rectangle** that fits inside the histogram.

\`\`\`text
Input:  [2, 1, 5, 6, 2, 3]
Output: 10    (bars 5 and 6: height 5 × width 2)

Input:  [2, 4]
Output: 4
\`\`\`

**Constraints:** 1 ≤ n ≤ 100,000, 0 ≤ heights[i] ≤ 10,000.`,
      hints: [
        'For each bar, imagine it is the SHORTEST bar of the rectangle. How far can the rectangle stretch left and right?',
        'It stretches until it meets a shorter bar on each side. So you need the "previous smaller" and "next smaller" bar — a monotonic stack problem.',
        'Keep a stack of indexes with increasing heights. When a shorter bar comes, pop: the popped bar\'s rectangle ends here, and starts right after the new stack top.',
      ],
      solution: `**Idea:** brute force tries every pair (start, end) and tracks the min height → O(n²). Optimal: a **monotonic increasing stack**. Each bar is the shortest bar of exactly one "best" rectangle. When a shorter bar arrives, the taller bars on the stack cannot stretch further right, so we pop them and compute their area.

\`\`\`javascript
function largestRectangleArea(heights) {
  const stack = []; // indexes, heights increasing from bottom to top
  let best = 0;

  // i === heights.length acts as a final bar of height 0 that pops everything
  for (let i = 0; i <= heights.length; i++) {
    const current = i === heights.length ? 0 : heights[i];

    while (stack.length > 0 && heights[stack[stack.length - 1]] > current) {
      const height = heights[stack.pop()];               // this bar is the shortest
      // left edge = just after the new stack top (or 0 if the stack is empty)
      const leftEdge = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
      const width = i - leftEdge;                        // right edge is i - 1
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}

console.log(largestRectangleArea([2, 1, 5, 6, 2, 3])); // 10
\`\`\`

**Dry run** for \`[2, 1, 5, 6, 2, 3]\`:

- i=1 (1): pop 2 → width 1 → area 2.
- i=2,3: push 5, 6. Stack heights [1, 5, 6].
- i=4 (2): pop 6 → width 1 → 6. Pop 5 → left edge 2, width 2 → **10**.
- i=6 (end, 0): pop 3 → 3. Pop 2 → width 4 → 8. Pop 1 → width 6 → 6.
- Best = **10**.

**Complexity:** O(n) time (each index pushed and popped once). O(n) space.

**Edge cases:** all equal bars (\`[3,3,3]\` → 9). Zeros split the histogram. Empty input → 0.`,
      followUps: [
        {
          q: 'How do you solve "Maximal Rectangle" in a 0/1 matrix?',
          a: 'Build a histogram row by row: heights[c] = previous height + 1 if the cell is 1, else 0. Run this function on each row. O(rows × cols).',
        },
        {
          q: 'Why add a fake bar of height 0 at the end?',
          a: 'Bars still on the stack at the end never met a shorter bar. A height-0 bar forces them all to be popped and measured, so we do not need a second cleanup loop.',
        },
      ],
    },
    {
      id: 'serialize-deserialize-tree',
      title: 'Serialize and Deserialize a Binary Tree',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'trees',
      question: `Design two functions:

- \`serialize(root)\` turns a binary tree into a **string**.
- \`deserialize(data)\` turns that string back into the **same tree**.

You choose the format. The only rule: \`deserialize(serialize(root))\` must give back an identical tree (same shape and values).

\`\`\`text
        1
       / \\
      2   3
         / \\
        4   5

serialize(root)  ->  for example "1,2,#,#,3,4,#,#,5,#,#"
deserialize(...) ->  the same tree
\`\`\`

**Constraints:** 0 to 10,000 nodes, values from -1000 to 1000.`,
      hints: [
        'A list of values alone is not enough — many trees have the same in-order or pre-order values. You must also record where the empty children are.',
        'Use pre-order (node, left, right) and write a marker like "#" for every null child.',
        'To rebuild, read tokens in the same pre-order: a "#" means null; otherwise create the node, then build its left subtree, then its right subtree.',
      ],
      solution: `**Idea:** **pre-order DFS with null markers**. Writing "#" for every missing child makes the shape exact, so one traversal is enough to rebuild the tree. Deserialize reads the tokens in the same order with a shared index.

\`\`\`javascript
function serialize(root) {
  const out = [];
  function walk(node) {
    if (node === null) {
      out.push('#');       // marker for an empty child
      return;
    }
    out.push(String(node.val));
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return out.join(',');
}

function deserialize(data) {
  const tokens = data.split(',');
  let i = 0;               // next token to read

  function build() {
    const token = tokens[i++];
    if (token === '#') return null;

    const node = new TreeNode(Number(token));
    node.left = build();   // same order as serialize: left first
    node.right = build();
    return node;
  }
  return build();
}
\`\`\`

**Dry run** for the tree above: serialize → \`"1,2,#,#,3,4,#,#,5,#,#"\`.

Deserialize: read 1 → build left: read 2 → left "#", right "#" → back. Build right of 1: read 3 → left: 4 (with "#","#") → right: 5 (with "#","#"). Same tree.

**Complexity:** O(n) time and O(n) space for both functions (the string holds n values plus n + 1 markers).

**Edge cases:** empty tree → \`"#"\` → back to null. Negative values work because we split on commas, not on "-".`,
      followUps: [
        {
          q: 'Could you use BFS (level order) instead?',
          a: 'Yes — that is the LeetCode array format like `[1,2,3,null,null,4,5]`. Use a queue; for each node write its two children (or null). Deserialize with a queue of parents, attaching two tokens at a time.',
        },
        {
          q: 'Why not just use JSON.stringify on the tree object?',
          a: 'It works for plain objects, but it is much bigger (key names repeated), it breaks on cycles or parent pointers, and the interviewer wants to see that you understand null markers and traversal order.',
        },
        {
          q: 'If the tree is a BST, can the string be shorter?',
          a: 'Yes. Pre-order values alone are enough for a BST, because the min/max bounds tell you where each value goes. No "#" markers needed.',
        },
      ],
    },
    {
      id: 'median-data-stream',
      title: 'Find Median from Data Stream',
      difficulty: 'hard',
      type: 'design',
      frequency: 'very common',
      relatedTopic: 'heaps',
      question: `Design a class \`MedianFinder\`:

- \`addNum(num)\` adds a number from a stream.
- \`findMedian()\` returns the median of all numbers so far.

The **median** is the middle value of the sorted list. If the count is even, it is the average of the two middle values.

\`\`\`javascript
const mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
mf.findMedian(); // 1.5
mf.addNum(3);
mf.findMedian(); // 2
\`\`\`

**Constraints:** up to 50,000 calls. Values can be negative. Aim for O(log n) per add and O(1) per median.`,
      hints: [
        'Brute force: keep a sorted array and insert in the right place (O(n) per add because of shifting).',
        'You only need the middle values. Split the numbers into a "small half" and a "large half".',
        'Small half = max-heap (its top is the biggest small number). Large half = min-heap (its top is the smallest large number). Keep their sizes equal or small half one bigger.',
      ],
      solution: `**Idea:** brute force keeps a sorted array (O(n) per insert). Optimal: **two heaps**.

- \`low\` is a **max-heap** with the smaller half. Its top is the largest of the small numbers.
- \`high\` is a **min-heap** with the larger half. Its top is the smallest of the big numbers.
- Keep \`low.size\` equal to \`high.size\` or one bigger. Then the median is \`low.top\` (odd count) or the average of both tops (even count).

JavaScript has no built-in heap, so we write a small one with a compare function.

\`\`\`javascript
class Heap {
  // compare(a, b) < 0 means a should be closer to the top
  constructor(compare) {
    this.data = [];
    this.compare = compare;
  }
  size() { return this.data.length; }
  top() { return this.data[0]; }

  push(value) {
    const d = this.data;
    d.push(value);
    let i = d.length - 1;
    while (i > 0) {                         // bubble up
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(d[i], d[parent]) >= 0) break;
      [d[i], d[parent]] = [d[parent], d[i]];
      i = parent;
    }
  }

  pop() {
    const d = this.data;
    const topValue = d[0];
    const last = d.pop();
    if (d.length > 0) {
      d[0] = last;
      let i = 0;
      while (true) {                        // sink down
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let best = i;
        if (l < d.length && this.compare(d[l], d[best]) < 0) best = l;
        if (r < d.length && this.compare(d[r], d[best]) < 0) best = r;
        if (best === i) break;
        [d[i], d[best]] = [d[best], d[i]];
        i = best;
      }
    }
    return topValue;
  }
}

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a);  // max-heap: smaller half
    this.high = new Heap((a, b) => a - b); // min-heap: larger half
  }

  addNum(num) {
    // 1. go through low so the biggest small number moves to high
    this.low.push(num);
    this.high.push(this.low.pop());

    // 2. rebalance: low may have one more, never fewer
    if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop());
    }
  }

  findMedian() {
    if (this.low.size() > this.high.size()) return this.low.top();
    return (this.low.top() + this.high.top()) / 2;
  }
}

const mf = new MedianFinder();
mf.addNum(1); mf.addNum(2);
console.log(mf.findMedian()); // 1.5
mf.addNum(3);
console.log(mf.findMedian()); // 2
\`\`\`

**Dry run:**

- add 1: low [1] → move 1 to high → high bigger → move back. low [1], high [].
- add 2: low [2, 1] → move 2 to high. low [1], high [2]. Median (1 + 2) / 2 = **1.5**.
- add 3: low [3, 1] → move 3 to high → high [2, 3] is bigger → move 2 back. low [2, 1], high [3]. Median = low.top = **2**.

**Complexity:** addNum O(log n) (a few heap operations). findMedian O(1). Space O(n).

**Why step 1 matters:** pushing every number through \`low\` first guarantees every number in \`low\` is ≤ every number in \`high\`.`,
      followUps: [
        {
          q: 'What if all numbers are between 0 and 100?',
          a: 'Use a counting array of size 101 and a total count. To find the median, walk the counts until you reach the middle position. O(1) add and O(100) median.',
        },
        {
          q: 'What if you only need the median of the last k numbers (sliding window median)?',
          a: 'You must also REMOVE numbers that leave the window. Use two heaps with "lazy deletion" (a Map of numbers to delete when they reach the top), or a balanced BST / sorted list.',
        },
      ],
    },
    {
      id: 'longest-increasing-path-matrix',
      title: 'Longest Increasing Path in a Matrix',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'dynamic-programming',
      question: `Given an \`m × n\` matrix of integers, return the length of the **longest strictly increasing path**. From each cell you can move up, down, left or right (no diagonals, no leaving the grid).

\`\`\`text
Input:  [[9, 9, 4],
         [6, 6, 8],
         [2, 1, 1]]
Output: 4    (path 1 -> 2 -> 6 -> 9)

Input:  [[3, 4, 5],
         [3, 2, 6],
         [2, 2, 1]]
Output: 4    (path 3 -> 4 -> 5 -> 6)
\`\`\`

**Constraints:** 1 ≤ m, n ≤ 200. Values can be negative.`,
      hints: [
        'DFS from every cell, moving only to bigger neighbours. Without caching, the same paths are explored many times (exponential).',
        'The longest path starting at a cell never changes. Cache it: memo[r][c] (DFS + memoization).',
        'You do not need a "visited" set: because the path is strictly increasing, it can never come back to a cell (no cycles).',
      ],
      solution: `**Idea:** brute-force DFS from every cell repeats work again and again. Optimal: **DFS + memoization**. \`dfs(r, c)\` returns the longest increasing path that **starts** at (r, c): 1 + the best of its bigger neighbours. Save the answer in \`memo\` so each cell is solved only once.

\`\`\`javascript
function longestIncreasingPath(matrix) {
  if (matrix.length === 0 || matrix[0].length === 0) return 0;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0)); // 0 = not computed
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(r, c) {
    if (memo[r][c] !== 0) return memo[r][c];   // already solved

    let best = 1;                              // the path with just this cell
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        matrix[nr][nc] > matrix[r][c]          // only move to a bigger value
      ) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  }

  let answer = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      answer = Math.max(answer, dfs(r, c));
    }
  }
  return answer;
}

console.log(longestIncreasingPath([[9, 9, 4], [6, 6, 8], [2, 1, 1]])); // 4
\`\`\`

**Dry run** (first example): dfs at the 9s → 1 (no bigger neighbour). dfs(6 at [1,0]) → 9 above → 2. dfs(2 at [2,0]) → 6 above → 3. dfs(1 at [2,1]) → neighbours 2 (3) and 6 (2) → 1 + 3 = **4**. Other cells give less → answer 4.

**Complexity:** O(m · n) time — each cell is computed once and looks at 4 neighbours. O(m · n) space for the memo and the recursion.

**Edge cases:** all equal values → 1 (no move is strictly bigger). Snake-shaped increasing grid → the whole grid.`,
      followUps: [
        {
          q: 'Why is memoization safe here when it is not for normal grid paths?',
          a: 'The "strictly increasing" rule means the moves form a DAG (a graph with no cycles). In a DAG the best path from a cell does not depend on how you reached it, so you can cache it.',
        },
        {
          q: 'Can you avoid deep recursion?',
          a: 'Yes, with topological sort (Kahn\'s algorithm): count for each cell how many smaller neighbours point into it, start BFS from cells with count 0, and the number of BFS levels is the answer.',
        },
      ],
    },
  ],
};
