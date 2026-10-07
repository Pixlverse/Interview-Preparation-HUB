// DSA & Problem Solving — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.
// Every JavaScript solution here was run with Node and the printed results match the comments.

export default {
  id: 'dsa',
  title: 'DSA & Problem Solving',
  icon: '🧮',
  description: 'Data structures, algorithms and the 30+ classic coding interview problems, explained in plain English with JavaScript solutions, dry runs and Big-O for every answer.',
  definitionTitle: 'What is DSA?',
  definition: `**DSA (Data Structures and Algorithms)** is about **organising data** and **solving problems efficiently**.

- A **data structure** is a way to store data. Examples are arrays, hash maps, stacks, queues, linked lists, trees, graphs and heaps.
- An **algorithm** is a step-by-step method to solve a problem, like sorting, searching, BFS/DFS or dynamic programming.

We measure efficiency with **Big-O notation**: how the time or memory needed grows as the input gets bigger.

**One-line answer:** "DSA is choosing the right data structure and algorithm to solve a problem efficiently, and Big-O is how we describe the time and space that solution needs as input grows."`,
  topics: [
    {
      id: 'problem-solving-framework',
      title: 'How to Solve a Coding Problem in an Interview',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A repeatable 6-step plan: understand, examples, brute force, optimize, code, test — and talk out loud the whole time.',
      what: `A coding interview is not only "can you get the answer". The interviewer watches **how you think**. A simple plan keeps you calm and shows a clear process:

1. **Understand** — repeat the problem in your own words. Ask about inputs, sizes, empty input, duplicates, negative numbers.
2. **Examples** — write 1-2 small examples, including an edge case (an "edge case" is an unusual input, like an empty array).
3. **Brute force** — say the simplest solution first, even if it is slow, and give its Big-O.
4. **Optimize** — find the repeated work and remove it. Usually with a hashmap, two pointers, sorting, or a better data structure.
5. **Code** — write clean code with good names. Talk while you type.
6. **Test** — dry run (walk through the code by hand) on your example, then on the edge cases. State the final time and space complexity.

#### Deeper version
Most interview problems are a known **pattern** in disguise. Learn to map clues to patterns:

- "Find a pair / check if seen before" → **hashmap**.
- "Sorted array" or "pair from both ends" → **two pointers**.
- "Longest / shortest contiguous subarray or substring" → **sliding window**.
- "Sorted, find a value fast" or "minimum value that works" → **binary search**.
- "Matching brackets, undo, next greater element" → **stack**.
- "Shortest path in an unweighted grid/graph, level by level" → **BFS** with a queue.
- "Explore all paths / connected parts" → **DFS** (recursion).
- "Top K / K-th largest / always get the smallest" → **heap**.
- "Count the ways / min cost / max profit with choices" → **dynamic programming**.
- "All combinations / permutations / subsets" → **backtracking**.

Also use the **input size** as a hint: n ≤ 20 often allows O(2^n), n ≤ 10^3 allows O(n²), n up to 10^5 or 10^6 needs O(n log n) or O(n).`,
      why: `Many good engineers fail coding rounds not because they cannot code, but because they jump into code, get stuck in silence, and miss edge cases. A fixed plan gives you something to do at every moment, shows the interviewer your thinking, and lets them give hints. Interviewers usually score communication, problem solving, code quality and testing — not only the final answer.`,
      analogy: `It is like a doctor seeing a patient. The doctor does not prescribe medicine in the first second. They ask questions (understand), check symptoms (examples), think of the common cause (brute force), then the best treatment (optimize), give the prescription (code), and ask you to come back for a check-up (test).`,
      code: [
        {
          title: 'The framework applied to "find two numbers that add up to target"',
          lang: 'javascript',
          code: `// 1. Understand: return the indexes of two numbers that sum to target.
//    Ask: exactly one answer? can I use the same element twice? (no)
// 2. Example: nums = [2, 7, 11, 15], target = 9 -> [0, 1]
// 3. Brute force: check every pair -> O(n^2) time, O(1) space
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}

// 4. Optimize: the inner loop "searches" for target - nums[i].
//    A Map makes that search O(1) -> O(n) time, O(n) space.
// 5. Code:
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

// 6. Test: normal case + edge cases
console.log(twoSumBrute([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([2, 7, 11, 15], 9));      // [ 0, 1 ]
console.log(twoSum([3, 3], 6));              // [ 0, 1 ]
console.log(twoSum([1, 2], 10));             // []`,
        },
        {
          title: 'Questions to ask before coding (checklist)',
          lang: 'text',
          code: `- What is the input type and size? (n up to 10? 10^5?)
- Can the input be empty? Can it have duplicates? Negative numbers?
- Is the input sorted? Can I change (mutate) it?
- What should I return if there is no answer? (-1, null, [])
- Is there exactly one answer, or many? Any order?
- Do you want the best time, or is a simple version OK first?`,
        },
      ],
      output: `Both functions print \`[ 0, 1 ]\` for the first example because \`2 + 7 = 9\`. For \`[3, 3]\` the Map version still works: when we reach index 1, we need \`3\`, and \`3\` was stored at index 0. For an impossible target we return \`[]\`.

The brute force is O(n²) because of the nested loops. The optimized version is O(n) time because each number is visited once, and Map lookups are O(1) on average. It uses O(n) extra space for the Map — this "trade space for time" move is the most common optimization in interviews.`,
      questions: [
        { q: 'What do you do when you are stuck?', a: 'Say it out loud, go back to a small example, and solve it by hand. Look at what work repeats. Ask "would sorting help? would a hashmap help?" Interviewers usually give a hint if you are talking.' },
        { q: 'Should I start with the brute force?', a: 'Yes, mention it with its Big-O in one or two sentences. It proves you understand the problem. Then say why it is slow and move to the better idea. Only code the brute force if you cannot find anything better.' },
        { q: 'How do you test your code without running it?', a: 'Dry run: pick a small input and track every variable line by line. Then check edge cases like empty input, one element, all duplicates, negative numbers and very large values.' },
        { q: 'How does input size hint at the expected complexity?', a: 'About 10^8 simple steps run in roughly a second. So n up to 10^5 needs O(n log n) or better, n up to 10^3 allows O(n²), and n up to about 20 can allow O(2^n).' },
      ],
      spoken: `"When I get a problem, I first repeat it in my own words and ask about edge cases — empty input, duplicates, negatives, and input size. Then I write a small example. I start by explaining the brute force and its complexity, so we agree on a correct baseline. Next I look for repeated work and pick a pattern — usually a hashmap, two pointers, sliding window, or binary search. I explain the plan before coding, then write clean code while talking. Finally I dry run it on my example and the edge cases, and state the time and space complexity."`,
      mistakes: [
        'Starting to code in the first minute without asking questions, then solving the wrong problem.',
        'Going silent. The interviewer cannot give hints or credit for thinking they cannot hear.',
        'Forgetting edge cases: empty array, one element, all equal values, negative numbers.',
        'Never stating the complexity. Always finish with "this is O(n) time and O(n) space because...".',
        'Follow-up trap: "Can you do it with O(1) extra space?" Think about sorting in place, two pointers, or reusing the input array — and mention the trade-off (sorting costs O(n log n) and changes the input).',
      ],
      takeaway: 'Understand → examples → brute force → optimize → code → test, and think out loud the whole time.',
    },
    {
      id: 'big-o',
      title: 'Big-O Notation (Time and Space Complexity)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Big-O describes how the work (time) or memory (space) of code grows as the input gets bigger.',
      what: `**Big-O** is a way to say how fast your code's work grows when the input grows. We call the input size **n** (for example, the length of an array).

- **Time complexity** — how many steps the code takes as n grows.
- **Space complexity** — how much extra memory the code uses as n grows (not counting the input itself).

We drop constants and small terms. \`2n + 5\` becomes **O(n)**. \`n² + n\` becomes **O(n²)**. We care about the shape of growth, not exact numbers.

Common complexities, fastest to slowest:

- **O(1)** constant — array index access \`arr[5]\`, \`map.get(key)\`.
- **O(log n)** logarithmic — binary search (cut the problem in half each step).
- **O(n)** linear — one loop over the array.
- **O(n log n)** — good sorting algorithms (merge sort, JS \`sort\`).
- **O(n²)** quadratic — two nested loops over the same array.
- **O(2^n)** exponential — trying every subset; naive recursive Fibonacci.
- **O(n!)** factorial — trying every ordering (permutations).

#### Deeper version
- Big-O is the **upper bound** (worst case) in everyday interview talk. Formally there is also Big-Omega (lower bound) and Big-Theta (tight bound), but interviewers almost always mean "worst case Big-O".
- **Average vs worst case:** hashmap lookup is O(1) on average but O(n) in the rare worst case (many keys collide). Quick sort is O(n log n) on average but O(n²) worst case.
- **Amortized** O(1): \`array.push\` is usually O(1), but sometimes the array must grow and copy everything (O(n)). Spread over many pushes, the average cost per push is still O(1).
- **Recursion uses space:** each recursive call sits on the call stack. A recursion that goes n levels deep uses O(n) space even with no arrays.
- **Two different inputs** get two letters: looping over array \`a\` and then array \`b\` is O(a + b), nested is O(a × b) — not O(n²).
- **Hidden costs in JS:** \`arr.includes\`, \`indexOf\`, \`slice\`, spread \`[...arr]\`, \`shift\`/\`unshift\` and string concatenation in a loop are all O(n). A loop that calls \`includes\` inside is O(n²).`,
      why: `Code that works on 10 items can freeze on 1 million items. Big-O lets you compare two solutions before you write them and predict if a solution is fast enough. In interviews you must state the complexity of every solution — it is the main way the interviewer judges if your answer is "optimal".`,
      analogy: `Imagine finding a friend's name:

- **O(1)**: you know their seat number — go straight there.
- **O(log n)**: a phone book sorted by name — open the middle, throw away half, repeat.
- **O(n)**: an unsorted guest list — read names one by one.
- **O(n²)**: for every guest, you compare them with every other guest to find people with the same birthday.`,
      code: [
        {
          title: 'One example for each common complexity',
          lang: 'javascript',
          code: `const arr = [4, 8, 15, 16, 23, 42];

// O(1): one step, no matter how big arr is
const first = arr[0];

// O(n): touch every element once
function sum(nums) {
  let total = 0;
  for (const x of nums) total += x;
  return total;
}

// O(n^2): nested loops over the same array
function hasDuplicateSlow(nums) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true;
  return false;
}

// O(log n): halve the search range each step (needs sorted input)
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(first);                  // 4
console.log(sum(arr));               // 108
console.log(hasDuplicateSlow(arr));  // false
console.log(binarySearch(arr, 23));  // 4`,
        },
        {
          title: 'Space complexity and a hidden O(n^2)',
          lang: 'javascript',
          code: `// O(n) extra space: we build a new array of the same size
const doubled = [1, 2, 3].map((x) => x * 2);

// O(n) space from recursion: n calls wait on the call stack
function countDown(n) {
  if (n === 0) return 0;
  return countDown(n - 1);
}

// Looks like one loop, but includes() is also a loop -> O(n^2)
function uniqueSlow(nums) {
  const out = [];
  for (const x of nums) if (!out.includes(x)) out.push(x);
  return out;
}

// Same job in O(n) with a Set (O(1) average lookup)
const uniqueFast = (nums) => [...new Set(nums)];

console.log(doubled);                    // [ 2, 4, 6 ]
console.log(countDown(1000));            // 0
console.log(uniqueSlow([1, 2, 2, 3]));   // [ 1, 2, 3 ]
console.log(uniqueFast([1, 2, 2, 3]));   // [ 1, 2, 3 ]`,
        },
      ],
      output: `For an array of 6 items the numbers are tiny, but the growth tells the story. If \`arr\` had 1,000,000 items: \`arr[0]\` is still 1 step, \`sum\` is about 1,000,000 steps, \`binarySearch\` is about 20 steps (because 2^20 ≈ 1,000,000), and \`hasDuplicateSlow\` is about 500 billion comparisons — far too slow.

In the second block, \`uniqueSlow\` and \`uniqueFast\` print the same answer, but \`uniqueSlow\` hides a loop inside \`includes\`, so it is O(n²). Replacing the array lookup with a Set makes it O(n).`,
      questions: [
        { q: 'What is Big-O notation?', a: 'A way to describe how the running time or memory of an algorithm grows as the input size n grows, ignoring constants. For example, one loop is O(n) and two nested loops are O(n²).' },
        { q: 'Why do we drop constants?', a: 'Because for large inputs the growth rate matters much more than a fixed multiplier. O(2n) and O(n) both double when n doubles, so we call both O(n).' },
        { q: 'What is the time complexity of JavaScript array methods?', a: '`push`/`pop` are O(1) (amortized). `shift`/`unshift`, `includes`, `indexOf`, `slice`, `splice`, `map`, `filter` are O(n). `sort` is O(n log n).' },
        { q: 'What is the space complexity of a recursive function?', a: 'At least the maximum depth of the recursion, because each call stays on the call stack until it returns. A recursion n levels deep is O(n) space.' },
        { q: 'What does amortized O(1) mean?', a: 'Most operations are O(1) but a rare one is expensive (like an array resizing). Averaged over many operations, the cost per operation is still O(1).' },
      ],
      spoken: `"Big-O describes how the time or memory of my code grows as the input size grows. I drop constants and smaller terms, so two separate loops are still O(n), while nested loops over the same array are O(n²). The common ones are O(1) for direct access or hashmap lookups, O(log n) for binary search, O(n) for a single pass, O(n log n) for sorting, and O(2^n) for trying every subset. For space, I count extra data structures and the recursion depth. In JavaScript I watch for hidden loops like includes or shift inside another loop."`,
      mistakes: [
        'Calling a loop with `includes()` or `indexOf()` inside it O(n). It is O(n²) because those methods loop too.',
        'Forgetting that recursion uses stack space: a recursive DFS on a deep tree is O(h) space, where h is the height.',
        'Saying O(n²) when there are two different inputs. Nested loops over arrays of size a and b are O(a × b).',
        'Ignoring the output size: building all subsets is at least O(2^n) because the answer itself has 2^n items.',
        'Follow-up trap: "Is a hashmap lookup always O(1)?" No — it is O(1) on average. In the worst case (many hash collisions) it can be O(n), but we normally state O(1) average.',
      ],
      takeaway: 'Big-O is the growth rate of time or memory as n grows — always state it, and watch for hidden loops inside loops.',
    },
    {
      id: 'arrays',
      title: 'Arrays',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'An ordered list with O(1) access by index; adding or removing at the end is fast, at the start or middle is O(n).',
      what: `An **array** is an ordered list of values. Each value has a position called an **index**, starting at 0.

- Reading or writing by index (\`arr[3]\`) is **O(1)** — instant.
- Adding/removing at the **end** (\`push\`, \`pop\`) is **O(1)**.
- Adding/removing at the **start** (\`unshift\`, \`shift\`) or middle (\`splice\`) is **O(n)**, because every other element must move one place.
- Searching for a value (\`includes\`, \`indexOf\`, \`find\`) is **O(n)** — it checks items one by one.

#### Deeper version
In languages like C, an array is one continuous block of memory, so the address of \`arr[i]\` is just \`start + i × size\` — that is why index access is O(1). JavaScript arrays are objects, but engines like V8 store "packed" arrays of the same type (all small integers, all numbers) in a continuous block too, so they are fast. If you create holes (\`arr[1000] = 1\` on an empty array) or mix types, V8 may switch to a slower dictionary-like mode.

Many array problems use these tricks:
- **In-place** changes (modify the input, O(1) extra space), often with a write pointer.
- **Prefix sums** — \`prefix[i]\` = sum of the first i items, so any range sum is \`prefix[r + 1] - prefix[l]\` in O(1).
- **Two passes** — one from the left, one from the right (see Product of Array Except Self).
- **Sorting first** — O(n log n), but then duplicates are neighbours and two pointers work.`,
      why: `Arrays are the most common input in coding interviews. Knowing which operations are cheap and which are expensive is what turns an O(n²) answer into an O(n) one. Many "hard-looking" problems are just one smart pass over an array.`,
      analogy: `An array is like a row of numbered lockers. If you know the locker number, you open it instantly (O(1)). But if you want to put a new locker at the front, every locker must be moved one step to the right (O(n)).`,
      code: [
        {
          title: 'Core operations and their cost',
          lang: 'javascript',
          code: `const nums = [10, 20, 30];

nums.push(40);          // O(1)  -> [10, 20, 30, 40]
nums.pop();             // O(1)  -> [10, 20, 30]
nums.unshift(5);        // O(n)  -> [5, 10, 20, 30] (everything shifts right)
nums.shift();           // O(n)  -> [10, 20, 30]
nums.splice(1, 0, 15);  // O(n)  -> insert 15 at index 1
console.log(nums);              // [ 10, 15, 20, 30 ]
console.log(nums[2]);           // 20 (O(1))
console.log(nums.includes(30)); // true (O(n) scan)

// Copy vs reference: arrays are objects
const ref = nums;        // same array
const copy = [...nums];  // new array (O(n))
ref.push(99);
console.log(nums.length, copy.length); // 5 4`,
        },
        {
          title: 'Prefix sums: any range sum in O(1)',
          lang: 'javascript',
          code: `// prefix[i] = sum of nums[0..i-1]
function buildPrefix(nums) {
  const prefix = [0];
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);
  return prefix;
}

const data = [3, 1, 4, 1, 5, 9];
const prefix = buildPrefix(data);
console.log(prefix); // [ 0, 3, 4, 8, 9, 14, 23 ]

// Sum of data[l..r] (inclusive) = prefix[r + 1] - prefix[l]
const rangeSum = (l, r) => prefix[r + 1] - prefix[l];
console.log(rangeSum(2, 4)); // 4 + 1 + 5 = 10`,
        },
      ],
      output: `After the operations, \`nums\` is \`[10, 15, 20, 30]\`. \`ref\` points to the same array, so pushing 99 through \`ref\` changes \`nums\` too (length 5), while \`copy\` was a separate array and stays at length 4.

In the prefix-sum example, building the prefix array takes O(n) once. After that, \`rangeSum(2, 4)\` is \`prefix[5] - prefix[2] = 14 - 4 = 10\`, which is \`4 + 1 + 5\`, in O(1).`,
      questions: [
        { q: 'Why is shift() slower than pop()?', a: '`pop` removes the last element and nothing else moves, so it is O(1). `shift` removes the first element and every other element must move one index to the left, so it is O(n).' },
        { q: 'How do you remove duplicates from an array?', a: '`[...new Set(arr)]` in O(n). If you must do it in place on a sorted array, use a write pointer that only copies a value when it differs from the previous one.' },
        { q: 'What is a prefix sum and when would you use it?', a: 'An array where `prefix[i]` is the sum of the first i elements. It turns any range-sum query into O(1) and is used in problems like "subarray sum equals K".' },
        { q: 'What does "in place" mean?', a: 'You change the input array directly and use only O(1) extra memory, instead of building a new array.' },
      ],
      spoken: `"An array stores values in order with an index starting at zero. Access by index is O(1), and push and pop at the end are O(1). Inserting or removing at the start or middle is O(n) because the other elements shift, and searching with includes or indexOf is O(n). In interviews I watch for hidden O(n) calls inside loops. Common array tricks I use are a write pointer for in-place changes, prefix sums for fast range sums, two passes from both ends, and sorting first so I can use two pointers."`,
      mistakes: [
        'Using `shift()` inside a loop to process a queue — each call is O(n), so the loop becomes O(n²). Use an index pointer instead.',
        'Thinking `const copy = arr` makes a copy. It copies the reference; both names point to the same array.',
        'Off-by-one errors with `arr.length` — the last index is `arr.length - 1`.',
        'Forgetting that spread `[...arr]` and `slice()` are shallow copies: nested objects are still shared.',
        'Follow-up trap: "Is `arr.length = 0` a valid way to clear an array?" Yes, it empties the same array in place (all references see it empty), unlike `arr = []` which makes a new array.',
      ],
      takeaway: 'Index access and push/pop are O(1); shift, splice, includes and copying are O(n) — design around that.',
    },
    {
      id: 'strings',
      title: 'Strings',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Strings in JS are immutable arrays of characters; build results with an array + join and count characters with a Map.',
      what: `A **string** is a sequence of characters. In JavaScript, strings are **immutable** — you can never change a character in place. \`s[0] = 'x'\` does nothing (in strict mode and ES modules it throws a \`TypeError\`). Every "change" creates a new string.

Useful operations:
- \`s.length\`, \`s[i]\` or \`s.charAt(i)\` — O(1).
- \`s.slice(a, b)\`, \`s.split('')\`, \`s.toLowerCase()\`, \`s.includes(x)\` — O(n).
- \`s.charCodeAt(i)\` — the number code of a character (\`'a'\` is 97). Handy for a 26-slot counting array: \`s.charCodeAt(i) - 97\`.

#### Deeper version
- Because strings are immutable, \`result += char\` in a loop *can* be O(n²) in theory (each step copies). Modern engines optimize this with "ropes", so in practice it is often fine, but the safe interview answer is: push characters into an array and \`join('')\` once at the end.
- Most string problems reduce to array patterns: **two pointers** (palindromes), **sliding window** (longest substring), **hashmap counting** (anagrams), **sorting** (group anagrams by sorted key).
- \`s.split('')\` splits by UTF-16 units, so emojis break into two parts. \`[...s]\` or \`Array.from(s)\` split by real characters (code points). Interview problems usually say "lowercase English letters", so either works — but it is a good detail to mention.`,
      why: `String questions (palindromes, anagrams, substrings, parsing) are some of the most common warm-up questions. They test whether you know the basic tools and can avoid slow patterns like nested \`includes\` calls or repeated string copies.`,
      analogy: `A string is like a printed sentence on paper. You cannot erase one letter — to "change" it, you print a new sheet. So if you need many changes, you write the letters on sticky notes (an array), rearrange them, and print once at the end (\`join\`).`,
      code: [
        {
          title: 'Everyday string tools',
          lang: 'javascript',
          code: `const s = 'Hello';
// s[0] = 'J'; // ignored in sloppy mode, TypeError in strict mode/modules
const changed = 'J' + s.slice(1); // "changing" = building a new string
console.log(s, changed);          // Hello Jello

console.log(s.split('').reverse().join('')); // olleH
console.log(s.toLowerCase().includes('ell')); // true
console.log('a'.charCodeAt(0), 'z'.charCodeAt(0)); // 97 122

// Build a result with an array + join instead of += in a loop
function repeatChars(str) {
  const out = [];
  for (const ch of str) out.push(ch, ch);
  return out.join('');
}
console.log(repeatChars('abc')); // aabbcc`,
        },
        {
          title: 'Counting characters (the base of many problems)',
          lang: 'javascript',
          code: `function charCount(str) {
  const count = new Map();
  for (const ch of str) count.set(ch, (count.get(ch) || 0) + 1);
  return count;
}
console.log(charCount('banana')); // Map(3) { 'b' => 1, 'a' => 3, 'n' => 2 }

// Fixed 26-slot array for lowercase letters (O(1) space)
function letterCounts(str) {
  const counts = new Array(26).fill(0);
  for (const ch of str) counts[ch.charCodeAt(0) - 97]++;
  return counts;
}
console.log(letterCounts('abca').slice(0, 3)); // [ 2, 1, 1 ]`,
        },
      ],
      output: `Assigning \`s[0] = 'J'\` would not work (strings are immutable), so we build a new string \`'J' + s.slice(1)\` instead; \`s\` stays \`Hello\`. Reversing works by splitting into an array, reversing the array, and joining it back: \`olleH\`.

The counting helpers show the most reused trick for string problems: walk the string once and count each character. The Map version works for any characters; the 26-slot array is O(1) space when the input is only lowercase letters (\`'a'\` maps to slot 0, \`'b'\` to slot 1, and so on).`,
      questions: [
        { q: 'Are JavaScript strings mutable?', a: 'No, they are immutable. Methods like `toUpperCase` or `replace` return a new string. Assigning to `s[i]` does nothing (and throws in strict mode).' },
        { q: 'How do you reverse a string in JavaScript?', a: '`s.split(\'\').reverse().join(\'\')`, or `[...s].reverse().join(\'\')` to handle emojis correctly. Both are O(n).' },
        { q: 'Why build strings with an array and join?', a: 'Each `+=` may create a new string copy, which can make a loop O(n²). Pushing to an array and joining once is O(n). Modern engines optimize `+=`, but array + join is the safe answer.' },
        { q: 'How do you check if two strings have the same characters?', a: 'Count characters in one string with a Map (or 26-slot array), subtract while walking the other, and check all counts are zero. O(n) time.' },
      ],
      spoken: `"In JavaScript, strings are immutable, so every change creates a new string. Index access and length are O(1), but slice, split, includes and toLowerCase are O(n). For building results in a loop I push characters into an array and join at the end. Most string problems are really array patterns: two pointers for palindromes, a sliding window for longest-substring problems, and a Map or a 26-slot count array for anagram-style counting. I also mention that split by empty string breaks emojis, while spreading the string handles them correctly."`,
      mistakes: [
        'Trying to change a character with `s[i] = x`. Convert to an array first, change it, then `join`.',
        'Calling `s.slice()` or `s.substring()` inside a loop without counting its O(n) cost.',
        'Forgetting to normalize case and remove non-letters when the problem says "ignore case and punctuation".',
        'Using `str.split(\'\')` on text with emojis and getting broken characters — `[...str]` is safer.',
        'Follow-up trap: "What is the space complexity of a 26-letter count array?" O(1), because its size is fixed at 26 no matter how long the string is.',
      ],
      takeaway: 'Strings are immutable: count with a Map, build with array + join, and reuse array patterns like two pointers and sliding window.',
    },
    {
      id: 'hashmaps',
      title: 'Hashmaps: Map, Set and Objects',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A hashmap stores key → value pairs with O(1) average lookup; use Map for key-value, Set for "have I seen this?".',
      what: `A **hashmap** (also called hash table or dictionary) stores **key → value** pairs. You can add, find and delete by key in **O(1)** time on average.

In JavaScript you have three tools:

- **\`Map\`** — the real hashmap. Keys can be any type (numbers, objects). Has \`set\`, \`get\`, \`has\`, \`delete\`, \`size\`, and keeps insertion order.
- **\`Set\`** — stores unique values only (no values attached). Perfect for "have I seen this before?".
- **Plain object \`{}\`** — also works as a map, but keys are converted to strings (\`obj[1]\` and \`obj['1']\` are the same key), and it has inherited keys like \`toString\`.

#### Deeper version
How it works: a **hash function** turns a key into a number, which picks a "bucket" in an internal array. Looking up a key means hashing it and jumping to that bucket — that is why it is O(1). If two keys land in the same bucket (a **collision**), they are stored together and checked one by one. With a bad hash or many collisions, lookups can degrade to O(n), so we say "O(1) average".

When the table gets too full, it **resizes** (makes a bigger array and re-inserts everything) — O(n) once, but amortized O(1) per insert.

Map vs object in interviews: prefer \`Map\` when keys are not plain strings, when you add/delete often, or when you need \`size\`. Objects are fine for simple string-key counters and JSON. Note: \`Map\` compares object keys by **reference**, so two different arrays \`[1,2]\` are two different keys — convert them to a string key like \`'1,2'\` if you need value equality.`,
      why: `The hashmap is the number one tool for optimizing interview problems. Whenever a brute force has an inner loop that "searches for something", a Map or Set can usually replace that loop with an O(1) lookup, turning O(n²) into O(n). Counting, grouping, de-duplicating and caching (memoization) all use hashmaps.`,
      analogy: `A hashmap is like a coat check at a theatre. You hand over your coat and get ticket number 42. Later you give "42" and the attendant goes straight to hook 42 — they don't search every hook. The ticket number is the key; the coat is the value.`,
      code: [
        {
          title: 'Map, Set and object basics',
          lang: 'javascript',
          code: `// Map: any key type, has size, keeps insertion order
const ages = new Map();
ages.set('asha', 30).set('ravi', 25);
console.log(ages.get('asha'));  // 30
console.log(ages.has('mina'));  // false
console.log(ages.size);         // 2

// Set: unique values, fast "seen before?"
const seen = new Set([1, 2, 2, 3]);
console.log(seen.size, seen.has(2)); // 3 true

// Object keys become strings
const obj = {};
obj[1] = 'one';
console.log(obj['1']);          // one -> 1 and '1' are the same key
const m = new Map([[1, 'num'], ['1', 'str']]);
console.log(m.get(1), m.get('1')); // num str -> different keys in a Map

// Map compares object keys by reference
const m2 = new Map();
m2.set([1, 2], 'a');
console.log(m2.get([1, 2]));    // undefined (a different array)
m2.set([1, 2].join(','), 'b');
console.log(m2.get('1,2'));     // b`,
        },
        {
          title: 'Classic use: Contains Duplicate and a frequency counter',
          lang: 'javascript',
          code: `// Contains Duplicate: true if any value appears twice
function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true; // O(1) lookup
    seen.add(x);
  }
  return false;
}
console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false

// Most frequent element
function mostFrequent(nums) {
  const freq = new Map();
  let best = null, bestCount = 0;
  for (const x of nums) {
    const c = (freq.get(x) || 0) + 1;
    freq.set(x, c);
    if (c > bestCount) { best = x; bestCount = c; }
  }
  return best;
}
console.log(mostFrequent([3, 1, 3, 2, 1, 3])); // 3`,
        },
      ],
      output: `The first block shows the key differences: a \`Map\` keeps \`1\` and \`'1'\` as separate keys, while an object turns both into the string \`'1'\`. Looking up \`[1, 2]\` with a new array returns \`undefined\` because Map compares objects by reference — joining into the string \`'1,2'\` fixes it.

\`containsDuplicate([1, 2, 3, 1])\` adds 1, 2, 3 to the Set, then sees 1 again and returns \`true\`. That is O(n) time and O(n) space, versus O(n²) for comparing every pair. \`mostFrequent\` counts in one pass and returns \`3\` (seen three times).`,
      questions: [
        { q: 'What is the time complexity of Map get/set/has?', a: 'O(1) on average. In the worst case with many collisions it can be O(n), but for interviews we say O(1) average.' },
        { q: 'When would you use a Map instead of a plain object?', a: 'When keys are not strings (numbers, objects), when you need `size` or guaranteed insertion order, or when you add and delete keys often. Map also avoids clashes with inherited keys like `constructor`.' },
        { q: 'What is the difference between Map and Set?', a: 'A Map stores key → value pairs. A Set stores only unique values. Use a Set for "have I seen this?" and a Map when you need to attach data like a count or an index.' },
        { q: 'What is a hash collision?', a: 'When two different keys produce the same bucket. The table stores both in that bucket and compares them one by one. Many collisions slow lookups down toward O(n).' },
        { q: 'How do you use an array as a Map key by value?', a: 'Convert it to a string, for example `arr.join(\',\')` or `JSON.stringify(arr)`, because Map compares array keys by reference.' },
      ],
      spoken: `"A hashmap stores key-value pairs and gives O(1) average lookup by hashing the key to a bucket. In JavaScript I use Map for key-value data because it accepts any key type, has a size property and keeps insertion order. I use Set when I only need to know if I've seen a value. Plain objects work for simple string counters, but they convert keys to strings. In interviews, whenever my brute force has an inner loop that searches for something, I try to replace it with a Map or Set lookup, which usually turns O(n²) into O(n) at the cost of O(n) memory."`,
      mistakes: [
        'Using `if (map.get(key))` to check existence — it fails when the stored value is `0`, `\'\'` or `false`. Use `map.has(key)`.',
        'Using arrays or objects as Map keys and expecting value equality. Convert them to string keys.',
        'Using a plain object with keys like `"constructor"` or `"__proto__"` and getting strange results. `Map` or `Object.create(null)` avoids this.',
        'Forgetting the space cost: a Map that stores every element is O(n) extra space.',
        'Follow-up trap: "Is Map iteration order guaranteed?" Yes — Map and Set iterate in insertion order. Plain objects put integer-like keys first in ascending order, then string keys in insertion order.',
      ],
      takeaway: 'Map for key → value, Set for "seen it?" — both O(1) average, and they are the fastest way to kill an inner loop.',
    },
    {
      id: 'easy-array-problems',
      title: 'Array Problems: Contains Duplicate, Move Zeroes, Best Time to Buy and Sell Stock',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Three warm-up array problems solved in one pass: a Set for duplicates, a write pointer for zeroes, and a running minimum for stock profit.',
      what: `Three classic warm-ups. Each one has a slow obvious answer and a fast one-pass answer.

**1. Contains Duplicate** — given \`nums\`, return \`true\` if any value appears at least twice.
- Brute force: compare every pair → O(n²).
- Better: sort, then check neighbours → O(n log n).
- Optimal: walk once and keep a **Set** of values seen so far → O(n) time, O(n) space.

**2. Move Zeroes** — move all \`0\`s to the end **in place**, keeping the order of the other numbers. \`[0,1,0,3,12]\` → \`[1,3,12,0,0]\`.
- Brute force: build a new array of non-zeros, then add zeros → O(n) but O(n) extra space (not in place).
- Optimal: a **write pointer**. Walk with \`read\`; every non-zero is swapped to position \`write\`, then \`write++\`. O(n) time, O(1) space.

**3. Best Time to Buy and Sell Stock** — \`prices[i]\` is the price on day i. Buy once and sell once later. Return the max profit (0 if you can't profit).
- Brute force: try every buy day with every later sell day → O(n²).
- Optimal: walk once, remember the **lowest price so far**, and at each day check "if I sell today, what's the profit?" O(n) time, O(1) space.

#### Deeper version
All three show the most important interview idea: **carry the information you need as you walk**, instead of looking back with an inner loop. The Set remembers "what I've seen", the write pointer remembers "where the next good value goes", and \`minPrice\` remembers "the best buy so far". The stock problem is also a tiny dynamic programming problem: the best answer ending at day i depends only on the minimum before day i.`,
      why: `These are the most common first questions in a screening round. Interviewers use them to see whether you jump to the nested-loop answer or naturally look for a single pass. They also check if you handle "in place" and edge cases (all zeros, prices only going down).`,
      analogy: `Stock problem: you walk through a market week by week, keeping a note of the cheapest price you've seen. Each new day you ask, "If I had bought at that cheapest day and sold today, how much would I earn?" You only ever need that one note, not the whole history.`,
      code: [
        {
          title: 'Contains Duplicate — three approaches',
          lang: 'javascript',
          code: `// O(n^2) time, O(1) space
function containsDuplicateBrute(nums) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true;
  return false;
}

// O(n log n) time: after sorting, duplicates sit next to each other
function containsDuplicateSort(nums) {
  const sorted = [...nums].sort((a, b) => a - b); // copy so we don't mutate input
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i] === sorted[i - 1]) return true;
  return false;
}

// O(n) time, O(n) space: remember what we've seen
function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
// One-liner version: new Set(nums).size !== nums.length

console.log(containsDuplicateBrute([1, 2, 3, 1])); // true
console.log(containsDuplicateSort([1, 2, 3, 4]));  // false
console.log(containsDuplicate([1, 1, 1, 3, 3]));   // true`,
        },
        {
          title: 'Move Zeroes — write pointer, in place',
          lang: 'javascript',
          code: `function moveZeroes(nums) {
  let write = 0; // next position for a non-zero value
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      // swap the non-zero into the write position
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums; // same array, changed in place
}

console.log(moveZeroes([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]
console.log(moveZeroes([0, 0, 1]));        // [ 1, 0, 0 ]
console.log(moveZeroes([1, 2]));           // [ 1, 2 ]`,
        },
        {
          title: 'Best Time to Buy and Sell Stock — running minimum',
          lang: 'javascript',
          code: `function maxProfit(prices) {
  let minPrice = Infinity; // cheapest buy seen so far
  let best = 0;            // best profit seen so far
  for (const price of prices) {
    if (price < minPrice) minPrice = price;          // better day to buy
    else best = Math.max(best, price - minPrice);    // try selling today
  }
  return best;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5 (buy at 1, sell at 6)
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0 (prices only fall)`,
        },
      ],
      output: `**Dry run — Move Zeroes on \`[0, 1, 0, 3, 12]\`:**
- read=0: value 0 → skip. write=0.
- read=1: value 1 → swap with index 0 → \`[1, 0, 0, 3, 12]\`, write=1.
- read=2: value 0 → skip.
- read=3: value 3 → swap with index 1 → \`[1, 3, 0, 0, 12]\`, write=2.
- read=4: value 12 → swap with index 2 → \`[1, 3, 12, 0, 0]\`, write=3.

**Dry run — maxProfit on \`[7, 1, 5, 3, 6, 4]\`:**
- 7 → min=7. 1 → min=1. 5 → profit 4, best=4. 3 → profit 2. 6 → profit 5, best=5. 4 → profit 3.
- Answer **5**. For \`[7, 6, 4, 3, 1]\` every day is a new minimum, so best stays **0**.

**Complexity:** Contains Duplicate O(n) time / O(n) space with a Set. Move Zeroes O(n) time / O(1) space. Max Profit O(n) time / O(1) space.`,
      questions: [
        { q: 'Contains Duplicate: how would you solve it with O(1) extra space?', a: 'Sort the array in place (O(n log n)) and compare each element with its neighbour. It uses no extra Set, but it changes the input and is slower than the O(n) Set approach.' },
        { q: 'Move Zeroes: why not just filter out zeros and push them at the end?', a: 'That works but creates a new array (O(n) extra space). The problem asks for in place, so the write-pointer swap is the expected answer with O(1) space.' },
        { q: 'Best Time to Buy and Sell Stock: why does a single pass work?', a: 'For each day, the best buy is always the cheapest price before it. Keeping a running minimum gives that in O(1), so we never need to look back.' },
        { q: 'What if you can buy and sell many times (Stock II)?', a: 'Add every positive difference between consecutive days: `profit += Math.max(0, prices[i] - prices[i - 1])`. That captures every upward move. O(n) time.' },
      ],
      spoken: `"For Contains Duplicate, the brute force compares every pair in O(n²). I'd use a Set instead: walk once, and if a value is already in the Set, return true. That's O(n) time and O(n) space. For Move Zeroes I keep a write pointer and swap every non-zero to the front, which keeps order and is in place with O(1) space. For the stock problem, I track the minimum price so far and, at every day, the profit if I sold today. One pass, O(n) time, O(1) space."`,
      mistakes: [
        'Stock problem: using the global minimum and global maximum. The max must come **after** the min, e.g. `[5, 1]` has min 1 and max 5 but profit 0.',
        'Move Zeroes: removing zeros with `splice` inside a loop — that is O(n²) and easy to get index bugs with.',
        'Contains Duplicate: sorting the input with `sort()` without a comparator (it sorts as strings) or mutating the input without saying so.',
        'Follow-up trap: "Contains Duplicate II — duplicates within distance k?" Keep a Map of value → last index, or a sliding-window Set of the last k values. O(n) time.',
      ],
      takeaway: 'Carry what you need while you walk (a Set, a write pointer, a running minimum) and most easy array problems become one O(n) pass.',
    },
    {
      id: 'hashmap-problems-easy',
      title: 'Hashmap Problems: Two Sum, Valid Anagram, First Unique Character',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Use a Map to remember what you have seen (Two Sum) or to count characters (Anagram, First Unique) and solve each in O(n).',
      what: `**1. Two Sum** — given \`nums\` and \`target\`, return the indexes of the two numbers that add up to \`target\`. Exactly one answer exists; you can't use the same element twice.
- Brute force: try every pair → O(n²).
- Optimal: for each number \`x\`, the partner you need is \`target - x\`. Keep a **Map of value → index** for numbers already seen. If the partner is in the Map, done. O(n) time, O(n) space.

**2. Valid Anagram** — are \`s\` and \`t\` anagrams (same letters, same counts, any order)? \`"anagram"\` and \`"nagaram"\` → true.
- Simple: sort both strings and compare → O(n log n).
- Optimal: count letters of \`s\`, subtract letters of \`t\`, all counts must end at 0 → O(n) time, O(1) space for a fixed alphabet.

**3. First Unique Character** — return the index of the first character that appears only once in \`s\`, or -1. \`"leetcode"\` → 0.
- Brute force: for each character, scan the whole string to count it → O(n²).
- Optimal: **two passes**. Pass 1 counts every character. Pass 2 finds the first index whose count is 1. O(n) time, O(1) space (at most 26 letters).

#### Deeper version
Two Sum stores **after** checking: we look for the partner first, then add the current number. That is what stops us from pairing a number with itself (e.g. \`[3, 2, 4]\`, target 6 must not return \`[0, 0]\`).

If the array is **sorted**, Two Sum can be done with two pointers in O(1) space (Two Sum II). For anagrams with Unicode input, use a Map instead of a 26-slot array. For First Unique on a **stream** of characters, keep counts plus an ordered queue (or rely on Map's insertion order) of candidates.`,
      why: `Two Sum is the most famous interview question in the world, and these three together teach the two basic hashmap moves: **"remember what I've seen"** and **"count, then check"**. Almost every medium hashmap problem (Group Anagrams, Top K, Subarray Sum Equals K) builds on them.`,
      analogy: `Two Sum is like a dance party where each person needs a partner with a matching number. Instead of asking everyone in the room, you write your name on a board. Each newcomer checks the board for their match first — if it's there, they pair up instantly.`,
      code: [
        {
          title: 'Two Sum — one-pass Map',
          lang: 'javascript',
          code: `function twoSum(nums, target) {
  const indexOf = new Map(); // value -> index where we saw it
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (indexOf.has(need)) return [indexOf.get(need), i]; // partner found
    indexOf.set(nums[i], i); // store AFTER checking (no self-pairing)
  }
  return []; // no pair
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]
console.log(twoSum([3, 3], 6));         // [ 0, 1 ]`,
        },
        {
          title: 'Valid Anagram — count up, count down',
          lang: 'javascript',
          code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false; // quick exit
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1);
  for (const ch of t) {
    if (!count.get(ch)) return false; // missing or already used up
    count.set(ch, count.get(ch) - 1);
  }
  return true; // same length + nothing went below 0 -> all zero
}

// Simple version: sort and compare (O(n log n))
const isAnagramSort = (s, t) => [...s].sort().join('') === [...t].sort().join('');

console.log(isAnagram('anagram', 'nagaram'));  // true
console.log(isAnagram('rat', 'car'));          // false
console.log(isAnagramSort('listen', 'silent')); // true`,
        },
        {
          title: 'First Unique Character — count, then scan',
          lang: 'javascript',
          code: `function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1); // pass 1
  for (let i = 0; i < s.length; i++) {                          // pass 2
    if (count.get(s[i]) === 1) return i;
  }
  return -1;
}

console.log(firstUniqChar('leetcode'));     // 0 ('l')
console.log(firstUniqChar('loveleetcode')); // 2 ('v')
console.log(firstUniqChar('aabb'));         // -1`,
        },
      ],
      output: `**Dry run — Two Sum on \`[3, 2, 4]\`, target 6:**
- i=0, x=3: need 3. Map is empty → store {3:0}.
- i=1, x=2: need 4. Not in Map → store {3:0, 2:1}.
- i=2, x=4: need 2. Found at index 1 → return **[1, 2]**.
Note at i=0 we did not return [0, 0], because 3 was not stored yet when we checked.

**Dry run — isAnagram("rat", "car"):** counts after s: r:1, a:1, t:1. Walking t: c → count is undefined → return **false**.

**Dry run — firstUniqChar("loveleetcode"):** counts l:2, o:2, v:1, e:4, t:1, c:1, d:1. Scanning from the left: l(2), o(2), v(1) → return **2**.

**Complexity:** Two Sum O(n) time / O(n) space. Valid Anagram O(n) time / O(1) space for a fixed alphabet (O(k) for k distinct characters). First Unique O(n) time / O(1) space for lowercase letters.`,
      questions: [
        { q: 'Two Sum: why do you check the Map before inserting the current number?', a: 'So a number cannot pair with itself. If we inserted first, `[3, 2, 4]` with target 6 would wrongly return `[0, 0]`.' },
        { q: 'Two Sum: what if the array is sorted?', a: 'Use two pointers: left at the start, right at the end. If the sum is too small move left forward, if too big move right back. O(n) time and O(1) space.' },
        { q: 'Valid Anagram: which is better, sorting or counting?', a: 'Counting is O(n) time versus O(n log n) for sorting. Sorting is shorter to write and fine for small inputs, but counting is the optimal answer.' },
        { q: 'First Unique Character: why two passes instead of one?', a: 'You only know a character is unique after seeing the whole string. The first pass counts everything; the second pass finds the earliest index with count 1. Two passes is still O(n).' },
      ],
      spoken: `"For Two Sum, the brute force checks all pairs in O(n²). Instead I walk once with a Map from value to index. For each number I compute target minus the number; if that partner is already in the Map, I return both indexes, otherwise I store the current number. That's O(n) time and O(n) space. Valid Anagram and First Unique Character are both counting problems: I count characters in a Map, then either subtract the second string's letters or scan again for the first character with count one. Both are O(n) time."`,
      mistakes: [
        'Two Sum: returning the values instead of the indexes, or sorting the array first and losing the original indexes.',
        'Two Sum: inserting all numbers into the Map first, then looking up — this needs an extra check so a number does not match itself.',
        'Valid Anagram: forgetting the length check, so `"ab"` and `"abc"` could look valid if you only check that every letter of `t` exists.',
        'First Unique: using `s.indexOf(ch) === s.lastIndexOf(ch)` inside a loop — it works but is O(n²).',
        'Follow-up trap: "Two Sum — return all unique pairs, with duplicates in the input?" Sort and use two pointers, skipping equal values after each match, or use a Map of counts. That leads straight to 3Sum.',
      ],
      takeaway: 'Two Sum = "remember what I\'ve seen" in a Map; Anagram and First Unique = "count, then check" — all O(n).',
    },
    {
      id: 'easy-string-problems',
      title: 'String Problems: Valid Palindrome, Longest Common Prefix',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Valid Palindrome uses two pointers moving inward; Longest Common Prefix compares characters column by column.',
      what: `**1. Valid Palindrome** — a palindrome reads the same forwards and backwards. Ignore case and anything that is not a letter or digit. \`"A man, a plan, a canal: Panama"\` → true.
- Simple: clean the string (lowercase, keep only letters/digits), reverse it, compare → O(n) time but O(n) extra space.
- Optimal: **two pointers**. \`left\` starts at the beginning, \`right\` at the end. Skip non-alphanumeric characters, compare lowercase characters, move both inward. O(n) time, O(1) space.

**2. Longest Common Prefix** — the longest starting text shared by all strings. \`["flower","flow","flight"]\` → \`"fl"\`.
- Approach (vertical scan): look at character 0 of every word, then character 1, and so on. Stop at the first position where a word is too short or the characters differ. O(S) time, where S is the total number of characters.
- Alternative: sort the words; the common prefix of the whole list equals the common prefix of the **first and last** word after sorting. O(n log n × m) because of the sort.

#### Deeper version
"Alphanumeric" means letters A-Z/a-z and digits 0-9. A regex \`/[a-z0-9]/i\` checks it. For huge inputs with many queries on prefixes (autocomplete), a **Trie** (prefix tree) is the real-world structure. The palindrome two-pointer idea extends to "Valid Palindrome II" (allowed to delete one character): on the first mismatch, try skipping the left char or the right char and check the rest.`,
      why: `Palindrome checks are the classic two-pointer warm-up, and they test careful handling of edge cases (punctuation, case, empty string). Longest Common Prefix tests clean loop logic and early exit. Both appear often as first questions in phone screens.`,
      analogy: `Checking a palindrome is like two people reading a word from opposite ends and walking toward each other, calling out letters. If every pair of called-out letters matches until they meet in the middle, it's a palindrome. Punctuation is a "skip this one" signal.`,
      code: [
        {
          title: 'Valid Palindrome — two pointers, O(1) space',
          lang: 'javascript',
          code: `const isAlnum = (ch) => /[a-z0-9]/i.test(ch);

function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;   // skip junk
    while (left < right && !isAlnum(s[right])) right--; // skip junk
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}

// Simple version: clean, reverse, compare (O(n) extra space)
function isPalindromeSimple(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === [...clean].reverse().join('');
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('race a car'));                     // false
console.log(isPalindrome(' '));                              // true
console.log(isPalindromeSimple('No lemon, no melon'));       // true`,
        },
        {
          title: 'Longest Common Prefix — vertical scan',
          lang: 'javascript',
          code: `function longestCommonPrefix(strs) {
  if (strs.length === 0) return '';
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    const ch = first[i];
    for (let j = 1; j < strs.length; j++) {
      // stop if a word is too short or the character differs
      if (i >= strs[j].length || strs[j][i] !== ch) return first.slice(0, i);
    }
  }
  return first; // the whole first word is a prefix of all others
}

console.log(longestCommonPrefix(['flower', 'flow', 'flight'])); // fl
console.log(longestCommonPrefix(['dog', 'racecar', 'car']));    // '' (empty line)
console.log(longestCommonPrefix(['interview', 'inter']));       // inter`,
        },
      ],
      output: `**Dry run — isPalindrome("race a car"):** left points at 'r', right at 'r' → match. Next 'a' vs 'a' → match. 'c' vs 'c' → match. 'e' vs ' ' → skip the space on the right, now 'e' vs 'a' → mismatch → **false**.

For \`" "\`, the only character is skipped and the loop ends → **true** (an empty cleaned string is a palindrome).

**Dry run — longestCommonPrefix(["flower","flow","flight"]):**
- i=0: 'f' in all → continue.
- i=1: 'l' in all → continue.
- i=2: 'o' vs "flight"[2] = 'i' → differ → return \`"fl"\`.

For \`["dog","racecar","car"]\` it stops at i=0 and returns the empty string (the console prints an empty line).

**Complexity:** Palindrome O(n) time, O(1) space. LCP O(S) time (S = total characters), O(1) extra space besides the result.`,
      questions: [
        { q: 'Why is the two-pointer palindrome check better than reverse-and-compare?', a: 'Both are O(n) time, but reverse-and-compare builds a cleaned copy and a reversed copy, using O(n) extra space. Two pointers use O(1) space and can stop at the first mismatch.' },
        { q: 'How would you solve Valid Palindrome II (delete at most one character)?', a: 'Move two pointers inward. On the first mismatch, check if the substring skipping the left char OR skipping the right char is a palindrome. O(n) time.' },
        { q: 'Longest Common Prefix: what is the sort trick?', a: 'After sorting the words alphabetically, the first and last words are the most different. Their common prefix is the common prefix of all words, so you only compare two strings.' },
        { q: 'What data structure would you use for many prefix queries?', a: 'A Trie (prefix tree). Each node is a character; walking down the tree finds all words with a prefix in O(length of the prefix).' },
      ],
      spoken: `"For Valid Palindrome I use two pointers, one at each end. I skip characters that aren't letters or digits, compare the two characters in lowercase, and move both pointers inward. If any pair differs, it's not a palindrome. That's O(n) time and O(1) space, better than building a cleaned and reversed copy. For Longest Common Prefix, I scan column by column: I take each character of the first word and check that every other word has the same character at that index. The first mismatch or short word ends the prefix. That's linear in the total number of characters."`,
      mistakes: [
        'Forgetting `left < right` inside the inner skip loops, which can run past the other pointer on strings like `".,"`.',
        'Comparing without lowercasing, so `"Aa"` is wrongly reported as not a palindrome.',
        'LCP: not handling an empty input array or a word shorter than the first word (index out of range gives `undefined`).',
        'Follow-up trap: "Is the empty string a palindrome?" Yes — it reads the same both ways. Say this out loud as an edge case.',
      ],
      takeaway: 'Palindromes → two pointers from both ends; common prefix → compare column by column and stop at the first mismatch.',
    },
    {
      id: 'recursion',
      title: 'Recursion',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'A function that calls itself on a smaller input; it needs a base case to stop and uses the call stack (O(depth) space).',
      what: `**Recursion** is when a function calls itself to solve a smaller version of the same problem.

Every recursive function needs two parts:
1. **Base case** — the smallest input where you already know the answer. This stops the recursion.
2. **Recursive case** — break the problem into a smaller piece and call the function on it.

Example: \`factorial(4) = 4 × factorial(3)\`, and \`factorial(1) = 1\` is the base case.

#### Deeper version
Each call is pushed onto the **call stack** (a list of "functions waiting to finish"). The stack grows until a base case returns, then the calls finish in reverse order. This is why recursion uses **O(depth)** space, and why very deep recursion throws \`RangeError: Maximum call stack size exceeded\` (V8's limit is roughly ten thousand frames, depending on frame size).

How to find the complexity: **(number of calls) × (work per call)**. \`factorial(n)\` makes n calls with O(1) work → O(n). Naive \`fib(n)\` makes two calls each time → about 2^n calls → O(2^n). Adding a cache (**memoization**) makes each \`fib(k)\` computed once → O(n).

Recursion is the natural way to work with **trees**, **graphs (DFS)**, **divide and conquer** (merge sort, quick sort) and **backtracking**. Any recursion can be rewritten as a loop with your own explicit stack — useful when depth may be large. JavaScript does not reliably do tail-call optimization (only Safari implements it), so don't rely on it.`,
      why: `Trees, graphs, sorting algorithms, backtracking and dynamic programming are all built on recursion. If you can think "solve the small case, trust the function for the rest", a lot of hard problems become a few lines of code.`,
      analogy: `Russian nesting dolls: to count the dolls, you open the outer one and say "1 + the number of dolls inside". You keep opening until you reach the tiny solid doll (the base case), which counts as 1. Then you add everything up on the way back out.`,
      code: [
        {
          title: 'Base case + recursive case',
          lang: 'javascript',
          code: `function factorial(n) {
  if (n <= 1) return 1;          // base case
  return n * factorial(n - 1);   // recursive case on a smaller input
}

// Sum of an array, recursively
function sum(arr, i = 0) {
  if (i === arr.length) return 0;      // base case: nothing left
  return arr[i] + sum(arr, i + 1);
}

// Reverse a string recursively
function reverse(s) {
  if (s.length <= 1) return s;
  return reverse(s.slice(1)) + s[0];
}

console.log(factorial(5));      // 120
console.log(sum([1, 2, 3, 4])); // 10
console.log(reverse('abc'));    // cba`,
        },
        {
          title: 'Fibonacci: O(2^n) vs memoized O(n)',
          lang: 'javascript',
          code: `let calls = 0;
function fibSlow(n) {
  calls++;
  if (n < 2) return n;
  return fibSlow(n - 1) + fibSlow(n - 2); // recomputes the same values
}

function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);   // reuse a saved answer
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

console.log(fibSlow(20), 'calls:', calls); // 6765 calls: 21891
console.log(fibMemo(50));                  // 12586269025

// Missing base case -> stack overflow
function forever(n) { return forever(n + 1); }
try { forever(0); } catch (e) { console.log(e.constructor.name); } // RangeError`,
        },
      ],
      output: `\`factorial(5)\` unwinds like this: \`5 × factorial(4)\` → \`5 × 4 × factorial(3)\` → ... → \`5 × 4 × 3 × 2 × 1 = 120\`. The calls stack up until \`factorial(1)\` returns 1, then each waiting call multiplies on the way back.

\`fibSlow(20)\` returns 6765 but needs **21,891** calls, because \`fib(18)\`, \`fib(17)\`, ... are recomputed again and again. \`fibMemo(50)\` returns instantly because each value is computed once and saved. The last example has no base case, so the stack fills up and JavaScript throws a \`RangeError\`.`,
      questions: [
        { q: 'What are the two parts of every recursive function?', a: 'A base case that returns directly and stops the recursion, and a recursive case that calls the function on a smaller input that moves toward the base case.' },
        { q: 'What is the space complexity of recursion?', a: 'O(maximum depth), because every call waits on the call stack until its children return. Factorial(n) is O(n) space even though it creates no arrays.' },
        { q: 'Why is naive recursive Fibonacci slow, and how do you fix it?', a: 'Each call makes two more calls, so it does about 2^n work and recomputes the same values. Memoization (caching results in a Map) makes it O(n). A loop with two variables makes it O(n) time and O(1) space.' },
        { q: 'Recursion or iteration — which is better?', a: 'Recursion is cleaner for trees, graphs and divide-and-conquer. Iteration avoids stack overflow and function-call overhead. For very deep inputs, convert recursion to a loop with an explicit stack.' },
      ],
      spoken: `"Recursion means a function solves a problem by calling itself on a smaller input. It needs a base case that stops the recursion and a recursive case that moves toward it. Each call sits on the call stack, so the space is at least the recursion depth, and too deep a recursion throws a stack overflow RangeError in JavaScript. To get the time complexity I multiply the number of calls by the work per call. When the same subproblems repeat, like in Fibonacci, I add memoization to cache answers, which turns exponential time into linear."`,
      mistakes: [
        'Forgetting the base case, or writing one the input never reaches (e.g. `n === 0` when n can be negative).',
        'Ignoring the call stack in space complexity — "it uses no extra memory" is wrong for recursion.',
        'Using `s.slice(1)` or `arr.slice(1)` in every call; it copies the input each time and turns O(n) into O(n²). Pass an index instead.',
        'Sharing a default mutable cache wrongly, or forgetting to pass `memo` down to the recursive calls.',
        'Follow-up trap: "Does JavaScript have tail-call optimization?" It is in the ES2015 spec, but only Safari implements it. In Node and Chrome a deep tail-recursive function still overflows, so use a loop.',
      ],
      takeaway: 'Base case + smaller recursive call; cost = calls × work per call, and space = recursion depth.',
    },
    {
      id: 'sorting-searching',
      title: 'Sorting and Searching (JS sort, Merge Sort, Quick Sort)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'JS sort() compares as strings unless you pass a comparator; merge sort is a stable O(n log n), quick sort is O(n log n) average and in place.',
      what: `**Sorting** puts items in order. **Searching** finds an item.

**JavaScript's \`sort()\`:**
- Without arguments it converts values to **strings** and sorts alphabetically. So \`[10, 9, 1].sort()\` gives \`[1, 10, 9]\`!
- For numbers, pass a **comparator** \`(a, b) => a - b\`. Return a negative number if \`a\` should come first, positive if \`b\` should come first, 0 if equal.
- \`sort()\` **changes the original array**. Use \`[...arr].sort()\` or \`arr.toSorted()\` (ES2023) to keep the original.
- It is O(n log n) and, since ES2019, guaranteed **stable** (equal items keep their original order).

**Searching:**
- **Linear search** — check every item, O(n). Works on any array.
- **Binary search** — on a **sorted** array, look at the middle and throw away half each step, O(log n).

#### Deeper version
**Merge sort** (divide and conquer): split the array in half, sort each half recursively, then **merge** the two sorted halves with two pointers. Always O(n log n) time (log n levels of splitting, O(n) merging per level), O(n) extra space, stable.

**Quick sort**: pick a **pivot**, move smaller items to its left and larger to its right (**partition**), then sort each side recursively. O(n log n) on average, but O(n²) worst case when the pivot is always the smallest or largest (e.g. already sorted input with a "last element" pivot). A random pivot makes the worst case very unlikely. It sorts in place (O(log n) stack space on average) and is not stable.

V8 (Chrome/Node) uses **TimSort** since 2018 — a mix of merge sort and insertion sort that is very fast on partly sorted data. Simple sorts like bubble, selection and insertion sort are O(n²); insertion sort is good for tiny or almost-sorted arrays. **Counting sort** can be O(n + k) when values are small integers in a range k.`,
      why: `Sorting is often the first step that unlocks a faster solution (duplicates become neighbours, two pointers work, intervals can be merged). Interviewers love the \`[10, 9, 1].sort()\` trap, and "write merge sort or quick sort" is a common question to test recursion and divide and conquer.`,
      analogy: `Merge sort is like sorting a big pile of exam papers with friends: split the pile in half, give each half to a friend to sort, then merge the two sorted piles by repeatedly taking the smaller top paper. Quick sort is like picking one paper's score as a "pivot", putting lower scores on the left table and higher on the right table, then doing the same on each table.`,
      code: [
        {
          title: 'JS sort and comparators',
          lang: 'javascript',
          code: `console.log([10, 9, 1, 100].sort());                 // [ 1, 10, 100, 9 ] (string order!)
console.log([10, 9, 1, 100].sort((a, b) => a - b));  // [ 1, 9, 10, 100 ]
console.log([10, 9, 1, 100].sort((a, b) => b - a));  // [ 100, 10, 9, 1 ]

// Sort objects by a field, then by a second field
const users = [
  { name: 'Ravi', age: 30 },
  { name: 'Asha', age: 25 },
  { name: 'Mina', age: 30 },
];
users.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
console.log(users.map((u) => u.name).join(', ')); // Asha, Mina, Ravi

// sort() mutates; copy first if you need the original
const original = [3, 1, 2];
const sorted = [...original].sort((a, b) => a - b);
console.log(original, sorted); // [ 3, 1, 2 ] [ 1, 2, 3 ]`,
        },
        {
          title: 'Merge sort — O(n log n), stable',
          lang: 'javascript',
          code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;              // base case
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));    // sort left half
  const right = mergeSort(arr.slice(mid));      // sort right half
  return merge(left, right);
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);         // <= keeps it stable
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);        // leftovers
  while (j < b.length) out.push(b[j++]);
  return out;
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10])); // [ 3, 9, 10, 27, 38, 43, 82 ]`,
        },
        {
          title: 'Quick sort — in place, O(n log n) average',
          lang: 'javascript',
          code: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);  // sort the left part
  quickSort(arr, p + 1, hi);  // sort the right part
  return arr;
}

// Lomuto partition with a random pivot
function partition(arr, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));
  [arr[r], arr[hi]] = [arr[hi], arr[r]];   // move pivot to the end
  const pivot = arr[hi];
  let i = lo;                              // next slot for a small value
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];   // pivot to its final place
  return i;
}

console.log(quickSort([5, 2, 9, 1, 5, 6])); // [ 1, 2, 5, 5, 6, 9 ]`,
        },
      ],
      output: `Without a comparator, \`sort()\` compares \`"10"\`, \`"9"\`, \`"1"\`, \`"100"\` as strings, so \`"100"\` comes before \`"9"\`. With \`a - b\` we get true numeric order. The users are sorted by age, and for equal ages (Ravi and Mina, both 30) by name, giving \`Asha, Mina, Ravi\`.

**Merge sort dry run on \`[38, 27, 43, 3]\`:** split → \`[38, 27]\` and \`[43, 3]\` → split again into single items → merge \`[27, 38]\` and \`[3, 43]\` → merge by taking the smaller front each time: 3, 27, 38, 43.

**Quick sort:** each partition puts the pivot in its final position, with smaller values on the left. The random pivot avoids the O(n²) worst case on sorted input.

**Complexity:** JS sort O(n log n). Merge sort O(n log n) time always, O(n) space. Quick sort O(n log n) average / O(n²) worst, O(log n) average stack space.`,
      questions: [
        { q: 'Why does [10, 9, 1].sort() return [1, 10, 9]?', a: 'Without a comparator, `sort` converts values to strings and compares them by UTF-16 code units, so "10" comes before "9". Pass `(a, b) => a - b` to sort numbers.' },
        { q: 'Merge sort vs quick sort?', a: 'Merge sort is always O(n log n), stable, but needs O(n) extra space. Quick sort is in place and usually faster in practice, but O(n²) in the worst case and not stable. A random pivot makes the worst case unlikely.' },
        { q: 'What does stable sorting mean?', a: 'Items that compare equal keep their original relative order. It matters when sorting by a second key, e.g. sort by name, then stable-sort by age, and people with the same age stay in name order.' },
        { q: 'What algorithm does JavaScript sort use?', a: 'The spec does not fix one. V8 (Chrome, Node) uses TimSort, a stable hybrid of merge sort and insertion sort, with O(n log n) worst case.' },
        { q: 'What is the lower bound for comparison sorting?', a: 'O(n log n). Any sort that only compares items needs at least about n log n comparisons in the worst case. Counting or radix sort can beat it for small integer ranges because they do not compare.' },
      ],
      spoken: `"JavaScript's sort converts items to strings by default, so for numbers I always pass a comparator like a minus b. It sorts in place and is stable since ES2019, and V8 uses TimSort, which is O(n log n). If I need to write my own, merge sort splits the array in half, sorts each half recursively, and merges them with two pointers: always O(n log n) time and O(n) space, and stable. Quick sort partitions around a pivot and recurses on each side; it's in place and fast on average, but O(n²) in the worst case, so I use a random pivot."`,
      mistakes: [
        'Calling `nums.sort()` on numbers without a comparator.',
        'Returning a boolean from the comparator (`(a, b) => a > b`). It must return a negative, zero or positive number.',
        'Forgetting that `sort()` mutates the input array — this can break callers that still need the original order.',
        'Quick sort with the first or last element as pivot on already-sorted input → O(n²) and possible stack overflow.',
        'Follow-up trap: "Can you sort in O(n)?" Only with extra assumptions — counting sort when values are small integers in a known range, or bucket/radix sort. General comparison sorting cannot beat O(n log n).',
      ],
      takeaway: 'Always pass a comparator to JS sort; merge sort = stable O(n log n) with O(n) space, quick sort = in-place O(n log n) average.',
    },
    {
      id: 'stacks',
      title: 'Stacks (LIFO)',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Last In, First Out: push and pop from the top in O(1). In JS a plain array with push/pop is a stack.',
      what: `A **stack** is a list where you only add and remove from **one end** — the top. The last item you put in is the first one out: **LIFO** (Last In, First Out).

Operations, all **O(1)**:
- \`push(x)\` — put on top.
- \`pop()\` — remove from top.
- \`peek()\` — look at the top without removing it (in JS: \`stack[stack.length - 1]\` or \`stack.at(-1)\`).
- \`isEmpty()\` — \`stack.length === 0\`.

In JavaScript a normal array **is** a stack: use \`push\` and \`pop\`.

#### Deeper version
Clues that a problem needs a stack:
- **Matching pairs** — brackets, HTML tags.
- **Undo / back** — browser history, text editor undo.
- **"Most recent unmatched thing"** — evaluate expressions, decode strings like \`3[a2[c]]\`.
- **Next greater / smaller element** — a **monotonic stack** keeps items in increasing (or decreasing) order. When a new item breaks the order, you pop items, and each popped item has found its "next greater" element. Each item is pushed and popped once, so it is O(n) total (Daily Temperatures, Largest Rectangle in Histogram).
- **Turning recursion into a loop** — the call stack is a stack, so iterative DFS uses an explicit stack.`,
      why: `Stacks give you "remember the latest thing and come back to it" in O(1). Valid Parentheses, Min Stack, Daily Temperatures and iterative tree traversal are common interview questions, and the JavaScript call stack itself is a stack — knowing this helps explain recursion and the event loop.`,
      analogy: `A stack of plates in a canteen. You put a clean plate on top and you take the top plate first. You never pull a plate from the bottom.`,
      code: [
        {
          title: 'Array as a stack',
          lang: 'javascript',
          code: `const stack = [];
stack.push('a');          // ['a']
stack.push('b');          // ['a', 'b']
stack.push('c');          // ['a', 'b', 'c']
console.log(stack.at(-1)); // c  (peek)
console.log(stack.pop());  // c
console.log(stack.pop());  // b
console.log(stack.length); // 1

// Use case: reverse a word with a stack
function reverseWord(word) {
  const st = [...word];
  let out = '';
  while (st.length) out += st.pop();
  return out;
}
console.log(reverseWord('stack')); // kcats`,
        },
        {
          title: 'Monotonic stack: Daily Temperatures (next warmer day)',
          lang: 'javascript',
          code: `// For each day, how many days until a warmer temperature? 0 if never.
function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // indexes of days still waiting for a warmer day
  for (let i = 0; i < temps.length; i++) {
    // today is warmer than the days on top of the stack -> they are answered
    while (stack.length && temps[i] > temps[stack.at(-1)]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [ 1, 1, 4, 2, 1, 1, 0, 0 ]`,
        },
      ],
      output: `The first block pushes a, b, c. Peek shows \`c\` (the last one in). Two pops return \`c\` then \`b\`, leaving one item. Popping every letter of "stack" reverses it to "kcats".

**Daily Temperatures dry run (first steps):** day 0 (73) pushed. Day 1 (74) is warmer than 73 → day 0 waits 1 day. Day 2 (75) answers day 1. Days 3 (71) and 4 (69) wait on the stack. Day 5 (72) answers day 4 (1 day) and day 3 (2 days). Day 6 (76) answers day 5 (1) and day 2 (4). Days 6 and 7 never find a warmer day → 0.

Each index is pushed and popped at most once, so it is **O(n)** time and O(n) space, even with the inner \`while\`.`,
      questions: [
        { q: 'What is a stack and what are its operations?', a: 'A LIFO structure: last in, first out. push, pop and peek are all O(1). In JavaScript an array with `push` and `pop` works as a stack.' },
        { q: 'Give real examples of stacks.', a: 'The function call stack, browser back button, undo in editors, matching brackets in a code editor, and iterative DFS.' },
        { q: 'What is a monotonic stack?', a: 'A stack kept in increasing or decreasing order. When a new value breaks the order you pop, and each pop answers a "next greater/smaller element" question. Total time is O(n) because each item is pushed and popped once.' },
        { q: 'Why is a nested while loop in Daily Temperatures still O(n)?', a: 'Amortized analysis: every index is pushed once and popped at most once, so all the inner loop runs together do at most n pops.' },
      ],
      spoken: `"A stack is last in, first out. I push and pop from the top, both in O(1), and in JavaScript I just use an array with push and pop. I reach for a stack when I need to match pairs, like brackets, when I need undo or back behaviour, or when I need the next greater or smaller element — that's the monotonic stack pattern, where each element is pushed and popped once so the whole thing is O(n). A stack is also how I convert a recursive DFS into an iterative one."`,
      mistakes: [
        'Using `shift`/`unshift` for a stack — they are O(n). Use the end of the array with `push`/`pop`.',
        'Calling `pop()` or peeking on an empty stack without checking; `[].pop()` returns `undefined`, which can silently break comparisons.',
        'Storing values instead of indexes in a monotonic stack when you need distances (like Daily Temperatures).',
        'Follow-up trap: "Is the nested loop O(n²)?" No — each element is pushed and popped once, so it is amortized O(n).',
      ],
      takeaway: 'Stack = LIFO with O(1) push/pop; think "matching pairs, undo, next greater element".',
    },
    {
      id: 'queues',
      title: 'Queues and Deques (FIFO)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'First In, First Out: add at the back, remove from the front. Avoid array.shift() in hot loops — use a head index or a linked list.',
      what: `A **queue** is a line: you add at the **back** (enqueue) and remove from the **front** (dequeue). The first item in is the first out: **FIFO** (First In, First Out).

A **deque** (double-ended queue, said "deck") lets you add and remove at **both** ends.

In JavaScript you can use an array with \`push\` (add to back) and \`shift\` (remove from front). It is simple and fine for small inputs, but \`shift\` is **O(n)** because every other element moves.

#### Deeper version
For an O(1) queue in JavaScript:
- **Head pointer:** keep pushing to an array and keep a \`head\` index for the front. Dequeue = read \`arr[head]\` and do \`head++\`. Nothing moves. (Optionally slice off the used part when \`head\` gets large to free memory.)
- **Linked list:** keep \`head\` and \`tail\` nodes; enqueue at tail, dequeue at head, both O(1).
- **Circular buffer:** a fixed-size array where indexes wrap around with \`% capacity\`.

Queues power **BFS** (breadth-first search) — exploring level by level in trees and grids — and real systems like job queues (BullMQ, SQS), the event loop's task queue, and rate limiters. A **monotonic deque** solves "sliding window maximum" in O(n).`,
      why: `BFS, level-order traversal and shortest path in an unweighted graph all need a queue. Knowing that \`shift\` is O(n) is a classic JavaScript-specific detail that interviewers like, because a BFS with \`shift\` on a big grid can become O(n²).`,
      analogy: `A queue at a coffee shop: new people join at the back, and the barista serves the person at the front. Nobody cuts the line. A deque is like a train where people can get on or off at both ends.`,
      code: [
        {
          title: 'Simple queue vs O(1) queue with a head pointer',
          lang: 'javascript',
          code: `// Simple (fine for small inputs): shift is O(n)
const q = [];
q.push(1); q.push(2); q.push(3);
console.log(q.shift()); // 1 (front)

// O(1) dequeue: never move elements, just move the head index
class Queue {
  constructor() { this.items = []; this.head = 0; }
  enqueue(x) { this.items.push(x); }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const x = this.items[this.head++];
    // free memory now and then
    if (this.head > 1000 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return x;
  }
  peek() { return this.items[this.head]; }
  get size() { return this.items.length - this.head; }
  isEmpty() { return this.size === 0; }
}

const queue = new Queue();
queue.enqueue('a'); queue.enqueue('b'); queue.enqueue('c');
console.log(queue.dequeue(), queue.dequeue()); // a b
console.log(queue.peek(), queue.size);         // c 1`,
        },
        {
          title: 'Queue in action: BFS shortest steps on a grid',
          lang: 'javascript',
          code: `// 0 = open, 1 = wall. Fewest steps from top-left to bottom-right.
function shortestPath(grid) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [[0, 0, 0]]; // [row, col, steps]
  const seen = new Set(['0,0']);
  let head = 0;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (head < queue.length) {
    const [r, c, steps] = queue[head++];          // O(1) dequeue
    if (r === rows - 1 && c === cols - 1) return steps;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc, key = nr + ',' + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          grid[nr][nc] === 0 && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc, steps + 1]);
      }
    }
  }
  return -1; // unreachable
}

console.log(shortestPath([
  [0, 0, 0],
  [1, 1, 0],
  [0, 0, 0],
])); // 4`,
        },
      ],
      output: `The simple queue returns \`1\` first because it was added first. The \`Queue\` class returns \`a\` then \`b\` without moving any elements — it only increments \`head\`. After two dequeues, \`c\` is at the front and the size is 1.

In the grid, BFS explores all cells 1 step away, then 2 steps away, and so on. The path goes right, right, down, down: **4 steps**. Because BFS explores in order of distance, the first time it reaches the target is guaranteed to be the shortest path.

**Complexity:** enqueue/dequeue O(1) with the head pointer. BFS on a grid is O(rows × cols) time and space.`,
      questions: [
        { q: 'What is the difference between a stack and a queue?', a: 'A stack is LIFO (last in, first out) — like plates. A queue is FIFO (first in, first out) — like a line at a shop. Stacks are used for DFS and undo; queues for BFS and task scheduling.' },
        { q: 'Why is array.shift() a problem for queues?', a: 'It is O(n) because every element moves one index left. In a BFS over n nodes that makes the total O(n²). Use a head index, a linked list, or a circular buffer for O(1).' },
        { q: 'Why does BFS find the shortest path in an unweighted graph?', a: 'It visits nodes in order of distance: all nodes 1 step away, then 2 steps, and so on. So the first time it reaches the target, no shorter path exists.' },
        { q: 'What is a deque used for?', a: 'Adding and removing at both ends. The classic use is the monotonic deque for "sliding window maximum", which gives O(n) instead of O(n·k).' },
      ],
      spoken: `"A queue is first in, first out — I add at the back and remove from the front. In JavaScript the quick version is an array with push and shift, but shift is O(n) because all elements move, so for BFS on large inputs I keep a head index and just increment it, which makes dequeue O(1). Queues are the core of breadth-first search, which explores level by level and gives the shortest path in unweighted graphs. In real systems the same idea shows up in job queues and the event loop's task queue."`,
      mistakes: [
        'Using `shift()` in a large BFS and getting O(n²) time.',
        'Marking a node as visited when you **dequeue** it instead of when you **enqueue** it — the same node gets added many times.',
        'Using a queue when you need priority order. If the "most urgent" item must come out first, you need a heap (priority queue).',
        'Follow-up trap: "How would you implement a queue using two stacks?" Push into an `in` stack; to dequeue, if the `out` stack is empty, pop everything from `in` into `out`, then pop from `out`. Each item moves once, so it is amortized O(1).',
      ],
      takeaway: 'Queue = FIFO, the engine of BFS; in JS use a head index instead of shift() for O(1) dequeue.',
    },
    {
      id: 'stack-problems',
      title: 'Stack Problems: Valid Parentheses, Min Stack',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Valid Parentheses pushes opening brackets and matches closers; Min Stack stores the current minimum alongside every value for O(1) getMin.',
      what: `**1. Valid Parentheses** — given a string of \`()[]{}\`, is it valid? Every opener must be closed by the same type, in the correct order. \`"([]{})"\` → true, \`"(]"\` → false, \`"([)]"\` → false.
- Brute force: repeatedly remove \`"()"\`, \`"[]"\`, \`"{}"\` until nothing changes → O(n²).
- Optimal: **stack**. Push every opener. For a closer, the top of the stack must be its matching opener — pop it. At the end the stack must be empty. O(n) time, O(n) space.

**2. Min Stack** — design a stack with \`push\`, \`pop\`, \`top\` and \`getMin\`, **all in O(1)**.
- Naive: scan the stack for the minimum → \`getMin\` is O(n).
- Optimal: store, next to each value, **the minimum at the time it was pushed**. Then the top entry always knows the current minimum. When you pop, the previous minimum comes back automatically.

#### Deeper version
Valid Parentheses quick exits: an odd-length string can never be valid. A Map from closer → opener keeps the code short.

Min Stack space trick: instead of pairs for every element, keep a second stack that only gets a push when the new value is **≤ the current min** — and pop it only when the popped value equals the current min. Use \`≤\` not \`<\`, otherwise duplicates of the minimum break it. Same O(1) time, often less memory.`,
      why: `Valid Parentheses is the classic stack question and appears in nearly every list of top interview problems. Min Stack is the classic "design a data structure" warm-up and tests whether you can trade a little memory for O(1) operations.`,
      analogy: `Valid Parentheses is like putting on and taking off clothes: socks, then shoes. You must take off the shoes before the socks — the last thing you put on is the first thing you take off. Min Stack is like a stack of boxes where each box has a sticky note saying "the lightest box from here down is X kg".`,
      code: [
        {
          title: 'Valid Parentheses',
          lang: 'javascript',
          code: `function isValid(s) {
  if (s.length % 2 === 1) return false;          // odd length can't match
  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);
  const stack = [];
  for (const ch of s) {
    if (pairs.has(ch)) {                         // a closer
      if (stack.pop() !== pairs.get(ch)) return false;
    } else {
      stack.push(ch);                            // an opener
    }
  }
  return stack.length === 0;                     // nothing left open
}

console.log(isValid('()[]{}')); // true
console.log(isValid('([]{})')); // true
console.log(isValid('(]'));     // false
console.log(isValid('([)]'));   // false
console.log(isValid('(('));     // false`,
        },
        {
          title: 'Min Stack — every entry remembers the min so far',
          lang: 'javascript',
          code: `class MinStack {
  constructor() { this.stack = []; } // entries: [value, minSoFar]
  push(val) {
    const min = this.stack.length ? Math.min(val, this.getMin()) : val;
    this.stack.push([val, min]);
  }
  pop() { this.stack.pop(); }
  top() { return this.stack.at(-1)[0]; }
  getMin() { return this.stack.at(-1)[1]; }
}

const ms = new MinStack();
ms.push(5); ms.push(2); ms.push(7); ms.push(2);
console.log(ms.getMin()); // 2
ms.pop();                 // removes the second 2
console.log(ms.getMin()); // 2 (the first 2 is still there)
ms.pop();                 // removes 7
ms.pop();                 // removes 2
console.log(ms.top(), ms.getMin()); // 5 5`,
        },
      ],
      output: `**Dry run — isValid("([)]"):** \`(\` push → \`[(]\`. \`[\` push → \`[(, []\`. \`)\` is a closer: pop gives \`[\`, but \`)\` needs \`(\` → return **false**. The order of closing is wrong even though the counts match.

**Dry run — isValid("(("):** both are pushed, the loop ends, the stack still has 2 items → **false**.

**Min Stack:** after pushing 5, 2, 7, 2 the entries are \`[5,5] [2,2] [7,2] [2,2]\`. \`getMin\` reads the top's second value: 2. Popping the second 2 leaves \`[7,2]\` on top → min still 2. After popping 7 and 2, only \`[5,5]\` remains → top 5, min 5.

**Complexity:** Valid Parentheses O(n) time, O(n) space. Min Stack: every operation O(1) time; O(n) space.`,
      questions: [
        { q: 'Why does counting brackets not work for Valid Parentheses?', a: 'Counts ignore order and type. `"([)]"` has matching counts but closes in the wrong order. A stack checks that each closer matches the most recent unclosed opener.' },
        { q: 'How would you check only one bracket type, like "(()"?', a: 'A single counter is enough: +1 for `(`, -1 for `)`. If it ever goes below 0, or does not end at 0, it is invalid. O(1) space.' },
        { q: 'How does Min Stack get the minimum in O(1)?', a: 'Each entry stores the minimum of everything at or below it. The top entry therefore always holds the current minimum, and popping restores the previous one automatically.' },
        { q: 'Can Min Stack use less memory?', a: 'Yes: keep a second stack that only stores a value when it is ≤ the current min, and pop from it only when the popped value equals its top. Same O(1) time, fewer stored entries in typical cases.' },
      ],
      spoken: `"For Valid Parentheses I use a stack. I push every opening bracket. When I see a closing bracket, I pop the top and check it's the matching opener; if not, the string is invalid. At the end, the stack must be empty. That's O(n) time and O(n) space. For Min Stack, the trick is to store, with every pushed value, the minimum at that moment. Then getMin just reads the top entry, and when I pop, the previous minimum is restored automatically. Every operation is O(1)."`,
      mistakes: [
        'Valid Parentheses: forgetting to check that the stack is empty at the end, so `"(("` returns true.',
        'Valid Parentheses: not handling a closer when the stack is empty (e.g. `")("`). In the code above `stack.pop()` returns `undefined`, which does not match, so it correctly returns false.',
        'Min Stack with a second stack: using `<` instead of `<=` when pushing to the min stack, which breaks when the minimum value appears twice.',
        'Min Stack: storing only one global `min` variable — after popping the minimum you cannot know the previous one.',
        'Follow-up trap: "Can you do Min Stack in O(1) extra space?" Yes, with an encoding trick: when pushing a new min, store `2 * val - oldMin` as a marker. It works but is tricky and can overflow in other languages, so the pair approach is the expected answer.',
      ],
      takeaway: 'Match the most recent opener with a stack; for O(1) getMin, store the running minimum with every entry.',
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Two indexes walking the array (from both ends, or one fast and one slow) to replace a nested loop with a single O(n) pass.',
      what: `**Two pointers** means using two index variables to walk through an array or string at the same time, instead of a nested loop.

Two main styles:
1. **Opposite ends** — \`left = 0\`, \`right = n - 1\`, move them toward each other. Used on **sorted** arrays (pair sum) and palindromes.
2. **Same direction (slow/fast or read/write)** — both start at the left. One reads, the other marks where to write. Used for removing duplicates, Move Zeroes, partitioning, and detecting cycles in linked lists.

#### Deeper version
Why it works on sorted arrays: if \`nums[left] + nums[right]\` is too small, the only way to grow the sum is to move \`left\` right (moving \`right\` left would make it even smaller). If it's too big, move \`right\` left. Each step throws away one candidate for good, so we do at most n steps → O(n) instead of O(n²).

The key question for every two-pointer problem: **"Which pointer can I move safely, and why can't the skipped options be the answer?"** If you can explain that, your solution is correct.

Related patterns: **sliding window** is two pointers in the same direction where the part between them is a "window"; **fast & slow pointers** (Floyd's algorithm) find the middle of a linked list or detect a cycle. Many problems (3Sum, Merge Intervals) start with "sort first, then two pointers" — remember the sort is O(n log n).`,
      why: `Two pointers turn many O(n²) pair searches into O(n) with O(1) extra space — often better than a hashmap when memory matters or when the input is already sorted. It shows up in Two Sum II, 3Sum, Container With Most Water, Valid Palindrome, Remove Duplicates and Merge Sorted Arrays.`,
      analogy: `Two people searching a sorted bookshelf for two books whose prices add up to ₹500. One starts at the cheap end, one at the expensive end. If the total is too low, the cheap-end person steps up to a pricier book. If it's too high, the expensive-end person steps down. They meet in the middle at the latest.`,
      code: [
        {
          title: 'Opposite ends: Two Sum II on a sorted array',
          lang: 'javascript',
          code: `// Sorted input. Return 1-based indexes of two numbers that sum to target.
function twoSumSorted(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;   // need a bigger sum
    else right--;               // need a smaller sum
  }
  return [];
}

console.log(twoSumSorted([2, 7, 11, 15], 9)); // [ 1, 2 ]
console.log(twoSumSorted([1, 3, 4, 6, 9], 10)); // [ 1, 5 ]`,
        },
        {
          title: 'Same direction: remove duplicates from a sorted array in place',
          lang: 'javascript',
          code: `// Returns the count k of unique values; nums[0..k-1] holds them.
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let write = 1;                         // slot for the next new value
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) { // a new value
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}

const arr = [1, 1, 2, 3, 3, 3, 4];
const k = removeDuplicates(arr);
console.log(k, arr.slice(0, k)); // 4 [ 1, 2, 3, 4 ]`,
        },
      ],
      output: `**Dry run — twoSumSorted([1, 3, 4, 6, 9], 10):**
- left=1, right=9 → 10 → found → return **[1, 5]** (1-based).

For \`[2, 7, 11, 15]\`, target 9: 2 + 15 = 17 too big → right moves to 11 → 13 too big → right moves to 7 → 9 → **[1, 2]**.

**Dry run — removeDuplicates([1,1,2,3,3,3,4]):** the reader skips repeated values; every new value (2, 3, 4) is copied to the \`write\` slot. The first 4 slots become \`[1, 2, 3, 4]\` and \`k = 4\`.

**Complexity:** both are O(n) time and O(1) extra space.`,
      questions: [
        { q: 'When do you use two pointers instead of a hashmap?', a: 'When the input is sorted (or sorting is allowed) and you want O(1) extra space, or when the problem is about pairs from both ends, palindromes, or in-place rewriting.' },
        { q: 'Why does moving the left pointer on a small sum never skip the answer?', a: 'Because the array is sorted, pairing `nums[left]` with anything left of `right` gives an even smaller sum. So `nums[left]` cannot be part of the answer and can be safely discarded.' },
        { q: 'What are fast and slow pointers?', a: 'Two pointers moving at different speeds, usually 1 and 2 steps. Used to find the middle of a linked list or detect a cycle (Floyd\'s algorithm), with O(1) space.' },
        { q: 'What is the complexity if you must sort first?', a: 'O(n log n) for the sort plus O(n) for the pointer pass, so O(n log n) overall. Mention that sorting may change the original indexes.' },
      ],
      spoken: `"Two pointers means walking the data with two indexes instead of a nested loop. With opposite ends, on a sorted array, I compare the sum at both pointers: if it's too small I move the left pointer right, if too big I move the right pointer left. Each move safely rules out one element, so it's O(n) time and O(1) space. With same-direction pointers, one reads and one writes, which is how I remove duplicates or move zeroes in place. The key is being able to explain why the pointer I move can't be part of the answer."`,
      mistakes: [
        'Using opposite-end two pointers on an **unsorted** array — the logic only works when the order tells you which way to move.',
        'Writing `while (left <= right)` for pair problems, which lets an element pair with itself.',
        'Sorting the array and then returning indexes, when the problem asks for the original indexes.',
        'Follow-up trap: "Two Sum on an unsorted array — hashmap or sort + two pointers?" Hashmap is O(n) time and O(n) space and keeps indexes. Sort + two pointers is O(n log n) time but O(1) extra space (if sorting in place is allowed).',
      ],
      takeaway: 'Two pointers replace a nested loop with one pass — always be able to say why the pointer you move can be safely discarded.',
    },
    {
      id: 'two-pointer-problems',
      title: 'Two Pointer Problems: 3Sum, Container With Most Water',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: '3Sum = sort, fix one number, two-pointer the rest and skip duplicates (O(n²)); Container = move the shorter wall inward (O(n)).',
      what: `**1. 3Sum** — find all **unique** triplets \`[a, b, c]\` in \`nums\` with \`a + b + c = 0\`. \`[-1,0,1,2,-1,-4]\` → \`[[-1,-1,2],[-1,0,1]]\`.
- Brute force: three nested loops + a Set to remove duplicate triplets → O(n³).
- Optimal: **sort** the array. Fix the first number \`nums[i]\`, then find pairs in the rest that sum to \`-nums[i]\` with **two pointers**. Skip equal values to avoid duplicate triplets. O(n²) time, O(1) extra space (besides the output and sort).

**2. Container With Most Water** — \`height[i]\` is a vertical wall. Pick two walls; the water they hold is \`min(height[l], height[r]) × (r - l)\`. Return the maximum. \`[1,8,6,2,5,4,8,3,7]\` → 49.
- Brute force: try every pair → O(n²).
- Optimal: start with the widest container (\`l = 0\`, \`r = n - 1\`). Always move the **shorter** wall inward. O(n) time, O(1) space.

#### Deeper version
**Why skip duplicates in 3Sum?** After sorting, equal values are neighbours. If \`nums[i] === nums[i - 1]\`, every triplet starting with it was already found, so skip. After finding a triplet, move \`left\` past all copies of its value (and \`right\` past copies of its value). Bonus early exit: if \`nums[i] > 0\`, no triplet can sum to 0 (everything after is ≥ it).

**Why move the shorter wall in Container?** The water is limited by the shorter wall. If we move the taller wall inward, the width shrinks and the height can't go above the shorter wall — the area can only get worse. So the shorter wall can never be part of a better answer with any wall inside, and we can drop it.`,
      why: `3Sum is a top-10 interview problem: it combines sorting, two pointers and careful duplicate handling, which is where most candidates make mistakes. Container With Most Water tests whether you can prove a greedy pointer move is correct, not just code it.`,
      analogy: `Container: imagine two people holding the ends of a rope between fence posts to trap water. The water level is set by the shorter post. Swapping the taller post for one closer in can't help — the short post still limits you and the rope got shorter. Your only hope is to replace the short post.`,
      code: [
        {
          title: '3Sum — sort + fix one + two pointers',
          lang: 'javascript',
          code: `function threeSum(nums) {
  const arr = [...nums].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < arr.length - 2; i++) {
    if (arr[i] > 0) break;                          // no way to reach 0
    if (i > 0 && arr[i] === arr[i - 1]) continue;   // skip duplicate first values
    let left = i + 1, right = arr.length - 1;
    while (left < right) {
      const sum = arr[i] + arr[left] + arr[right];
      if (sum < 0) left++;
      else if (sum > 0) right--;
      else {
        result.push([arr[i], arr[left], arr[right]]);
        left++;
        right--;
        while (left < right && arr[left] === arr[left - 1]) left++;   // skip dupes
        while (left < right && arr[right] === arr[right + 1]) right--;
      }
    }
  }
  return result;
}

console.log(JSON.stringify(threeSum([-1, 0, 1, 2, -1, -4]))); // [[-1,-1,2],[-1,0,1]]
console.log(JSON.stringify(threeSum([0, 0, 0, 0])));          // [[0,0,0]]
console.log(JSON.stringify(threeSum([1, 2, -2, -1])));         // []`,
        },
        {
          title: 'Container With Most Water — move the shorter wall',
          lang: 'javascript',
          code: `function maxArea(height) {
  let left = 0, right = height.length - 1, best = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    best = Math.max(best, h * (right - left));
    if (height[left] < height[right]) left++; // the shorter wall limits us
    else right--;
  }
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                      // 1`,
        },
      ],
      output: `**Dry run — 3Sum on \`[-1, 0, 1, 2, -1, -4]\`:** sorted → \`[-4, -1, -1, 0, 1, 2]\`.
- i=0 (-4): need pairs summing to 4. Max pair is 1 + 2 = 3 → none.
- i=1 (-1): left=-1, right=2 → sum 0 → **[-1, -1, 2]**. Move both: left=0, right=1 → sum 0 → **[-1, 0, 1]**.
- i=2 (-1): same as previous value → skip.
- i=3 (0): left=1, right=2 → sum 3 → right-- → pointers meet.
Result: \`[[-1,-1,2],[-1,0,1]]\`.

**Dry run — maxArea([1,8,6,2,5,4,8,3,7]):** l=0 (1), r=8 (7): area 1×8 = 8; left is shorter → l=1. l=1 (8), r=8 (7): area 7×7 = **49**; right shorter → r=7. Later areas (3×6=18, 8×5=40, 4×4=16, 5×3=15, 2×2=4, 6×1=6) are all smaller. Answer **49**.

**Complexity:** 3Sum O(n²) time (n outer × O(n) two-pointer), O(1) extra space apart from sorting/output. Container O(n) time, O(1) space.`,
      questions: [
        { q: '3Sum: why sort first?', a: 'Sorting lets us use two pointers for the inner pair search (O(n) instead of O(n²)) and puts duplicates next to each other so we can skip them easily without a Set.' },
        { q: '3Sum: can you do better than O(n²)?', a: 'No known general algorithm is meaningfully faster for interviews; O(n²) is the expected optimum. The hashmap version is also O(n²) but uses more space and makes de-duplication harder.' },
        { q: 'Container: why is it safe to move the shorter wall?', a: 'Any container using the shorter wall and a wall further inward has less width and height at most the shorter wall, so its area is smaller. So the shorter wall is done and can be dropped.' },
        { q: 'How does 3Sum generalize to 4Sum or kSum?', a: 'Sort, then fix numbers with outer loops (or recursion) and finish with two pointers. 4Sum is O(n³). Skip duplicates at every level.' },
      ],
      spoken: `"For 3Sum I sort the array first, then loop over each number as the first element of the triplet. For the rest of the array I use two pointers to find pairs that sum to the negative of that number. To avoid duplicate triplets I skip equal values for the first number and move the pointers past equal values after a match. That's O(n²) time. For Container With Most Water I start with the widest pair and always move the shorter wall inward, because the shorter wall limits the height and moving the taller one can never help. That's a single O(n) pass."`,
      mistakes: [
        '3Sum: using a Set of stringified triplets to remove duplicates — it works but is slower and messier; interviewers expect the skip-duplicates logic.',
        '3Sum: forgetting to skip duplicates for the **first** number, producing the same triplet twice.',
        '3Sum: sorting without a comparator (`sort()`), which breaks with negative numbers like `-4` and `-1` sorted as strings.',
        'Container: moving the taller wall, or moving both walls, and missing the optimum.',
        'Follow-up trap: "What about 3Sum Closest (closest sum to a target)?" Same sort + two pointers, but track the sum with the smallest `Math.abs(sum - target)` and move pointers based on whether sum is below or above target.',
      ],
      takeaway: '3Sum = sort + fix one + two pointers + skip duplicates (O(n²)); Container = always move the shorter wall (O(n)).',
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Keep a "window" between two pointers over a contiguous range and update it incrementally as it slides, instead of recomputing every subarray.',
      what: `A **sliding window** is a range \`[left, right]\` of an array or string that moves forward. Instead of recomputing everything for every subarray (O(n²) or worse), you **add the new element** on the right and **remove the old element** on the left, updating your answer in O(1) per step.

Two types:
1. **Fixed size** — the window always has k elements. Example: max sum of any 3 consecutive numbers. Add \`nums[right]\`, subtract \`nums[right - k]\`.
2. **Variable size** — grow \`right\` every step; **shrink** from \`left\` while the window breaks a rule. Example: longest substring without repeating characters.

Clue words: **"contiguous"**, **"subarray"**, **"substring"**, **"longest / shortest / maximum ... of size k"**.

#### Deeper version
Template for the variable window:

1. for \`right\` from 0 to n-1: add \`s[right]\` to the window state (a count Map, a sum...).
2. while the window is invalid: remove \`s[left]\` from the state, \`left++\`.
3. the window \`[left, right]\` is now valid → update the answer (\`right - left + 1\` for "longest").

Each element enters once and leaves once, so it's **O(n)** even with the inner \`while\`.

When it does **not** work: if the array has **negative numbers** and you want "sum equals K" or "sum ≥ K", shrinking the window doesn't reliably make the sum smaller, so the window logic breaks. Use **prefix sums + a hashmap** instead (see the Kadane/prefix topic). For "shortest window", update the answer **inside** the shrink loop; for "longest", update it **after** the shrink loop.`,
      why: `Substring and subarray questions are extremely common (Longest Substring Without Repeating Characters, Minimum Window Substring, Max Consecutive Ones III, Permutation in String). The sliding window turns them from O(n²) or O(n³) into O(n), and the same idea is used in real systems for rate limiting ("max 100 requests in any 60-second window").`,
      analogy: `Looking at a long painting through a picture frame you slide along the wall. You don't re-look at the whole painting each time — as the frame moves one step, one new strip appears on the right and one old strip disappears on the left.`,
      code: [
        {
          title: 'Fixed window: max sum of k consecutive numbers',
          lang: 'javascript',
          code: `function maxSumOfK(nums, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];  // first window
  let best = windowSum;
  for (let right = k; right < nums.length; right++) {
    windowSum += nums[right] - nums[right - k];      // add new, drop old
    best = Math.max(best, windowSum);
  }
  return best;
}

console.log(maxSumOfK([2, 1, 5, 1, 3, 2], 3)); // 9 (5 + 1 + 3)`,
        },
        {
          title: 'Variable window: shortest subarray with sum >= target',
          lang: 'javascript',
          code: `// Positive numbers only. Return the minimal length, or 0.
function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];                    // grow the window
    while (sum >= target) {                // valid -> try to shrink
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3])); // 2 ([4, 3])
console.log(minSubArrayLen(100, [1, 2, 3]));        // 0`,
        },
      ],
      output: `**Fixed window on \`[2, 1, 5, 1, 3, 2]\`, k=3:** first window 2+1+5 = 8. Slide: +1 −2 → 7. +3 −1 → 9. +2 −5 → 6. Best is **9**. Each slide is one addition and one subtraction instead of re-adding 3 numbers.

**Variable window for target 7 on \`[2, 3, 1, 2, 4, 3]\`:** the window grows to \`[2,3,1,2]\` (sum 8, length 4) → shrink to \`[3,1,2]\` (sum 6). Grow with 4 → \`[3,1,2,4]\` (10) → shrink to \`[1,2,4]\` (7, length 3) → shrink to \`[2,4]\` (6). Grow with 3 → \`[2,4,3]\` (9, length 3) → shrink to \`[4,3]\` (7, length **2**) → shrink. Answer **2**.

**Complexity:** both are O(n) time and O(1) space — each element is added once and removed at most once.`,
      questions: [
        { q: 'How do you recognize a sliding window problem?', a: 'The problem asks about a contiguous subarray or substring — longest, shortest, max sum, "at most k distinct" — and the window condition can be updated as you add or remove one element.' },
        { q: 'Why is a sliding window O(n) even with a nested while loop?', a: 'The left pointer only moves forward and never passes right. Each element is added once and removed once, so the total work across all iterations is at most 2n.' },
        { q: 'When does the sliding window fail?', a: 'When shrinking the window does not move the condition in one direction, e.g. sums with negative numbers. Then use prefix sums with a hashmap instead.' },
        { q: 'Fixed vs variable window?', a: 'Fixed: the size k is given; add the new element and remove the one k steps back. Variable: expand the right side every step and shrink the left side while the window is invalid.' },
      ],
      spoken: `"A sliding window keeps a range between a left and right pointer over a contiguous part of the array. As the right pointer moves, I add the new element to my window state, like a sum or a character count. If the window breaks the rule, I shrink it from the left until it's valid again, then update the answer. Each element enters and leaves the window once, so it's O(n). I use it for longest or shortest subarray or substring questions. If the array can have negative numbers and I need an exact sum, I switch to prefix sums with a hashmap."`,
      mistakes: [
        'Recomputing the whole window sum each step (O(n·k)) instead of adding the new value and subtracting the old one.',
        'Using a sliding window for "subarray sum equals K" with negative numbers — it gives wrong answers.',
        'Updating the answer in the wrong place: for "longest" update after shrinking, for "shortest" update inside the shrink loop.',
        'Off-by-one in window length: it is `right - left + 1`.',
        'Follow-up trap: "Sliding window maximum — max of every window of size k?" A plain window cannot remove the max in O(1). Use a monotonic deque of indexes (decreasing values): O(n) total.',
      ],
      takeaway: 'For contiguous subarrays/substrings: grow on the right, shrink on the left while invalid, update the answer — O(n).',
    },
    {
      id: 'sliding-window-problems',
      title: 'Sliding Window Problems: Longest Substring Without Repeating Characters, Longest Repeating Character Replacement',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Grow the window to the right and jump/shrink the left side when the window breaks the rule; track the best length.',
      what: `**1. Longest Substring Without Repeating Characters** — return the length of the longest substring with all different characters. \`"abcabcbb"\` → 3 (\`"abc"\`), \`"pwwkew"\` → 3 (\`"wke"\`).
- Brute force: check every substring for duplicates → O(n³) (or O(n²) with a Set per start).
- Optimal: sliding window with a **Map of character → last index seen**. When \`s[right]\` was seen **inside** the current window, jump \`left\` to just after that last position. O(n) time.

**2. Longest Repeating Character Replacement** — you may replace up to \`k\` characters. Return the longest substring of one repeated letter you can make. \`"AABABBA"\`, k=1 → 4.
- Idea: a window is valid if \`windowLength - countOfMostFrequentChar ≤ k\` (the others are the ones we replace). Grow right; if invalid, move left by one. O(n) time.

#### Deeper version
In problem 1, the check must be \`lastSeen.get(ch) >= left\`. A character seen **before** the window started is not a duplicate. Without this check \`left\` could jump **backwards** (e.g. \`"abba"\`), giving a wrong answer.

In problem 2 there is a famous subtle trick: \`maxCount\` (the highest frequency seen in any window) is never decreased when the window shrinks. This is still correct because the answer only grows when a window with a **higher** \`maxCount\` appears, so a stale (too high) \`maxCount\` can never produce a wrong bigger answer. If this feels risky in the interview, recompute the max over 26 counts — still O(26·n) = O(n).`,
      why: `"Longest Substring Without Repeating Characters" is one of the most asked medium questions anywhere. It's the cleanest test of the variable sliding window and of edge cases like \`"abba"\` and the empty string. The replacement problem shows the "window is valid if (length − best count) ≤ k" trick, which repeats in many window problems.`,
      analogy: `You're reading a sentence and want the longest stretch where no letter repeats. When you hit a repeated letter, you don't start over from the beginning — you just move your starting finger to right after the earlier copy of that letter and keep reading.`,
      code: [
        {
          title: 'Longest Substring Without Repeating Characters',
          lang: 'javascript',
          code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map(); // char -> last index
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    // duplicate inside the current window? jump left past it
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring('abcabcbb')); // 3
console.log(lengthOfLongestSubstring('bbbbb'));    // 1
console.log(lengthOfLongestSubstring('pwwkew'));   // 3
console.log(lengthOfLongestSubstring('abba'));     // 2
console.log(lengthOfLongestSubstring(''));         // 0`,
        },
        {
          title: 'Longest Repeating Character Replacement',
          lang: 'javascript',
          code: `function characterReplacement(s, k) {
  const count = new Map();
  let left = 0, maxCount = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = (count.get(s[right]) || 0) + 1;
    count.set(s[right], c);
    maxCount = Math.max(maxCount, c);
    // chars to replace = window length - most frequent char count
    if (right - left + 1 - maxCount > k) {
      count.set(s[left], count.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(characterReplacement('ABAB', 2));    // 4
console.log(characterReplacement('AABABBA', 1)); // 4`,
        },
      ],
      output: `**Dry run — lengthOfLongestSubstring("pwwkew"):**
- r=0 'p': window "p", best 1.
- r=1 'w': window "pw", best 2.
- r=2 'w': 'w' last seen at 1 (≥ left 0) → left=2. Window "w".
- r=3 'k': "wk", best 2. r=4 'e': "wke", best **3**.
- r=5 'w': 'w' last seen at 2 (≥ left 2) → left=3. Window "kew", still 3.

**Why \`"abba"\` needs the \`>= left\` check:** at r=2 ('b') left jumps to 2. At r=3 ('a'), 'a' was last seen at 0, which is **before** left, so we must not move left back to 1. Window "ba" → answer **2**.

**Replacement on "AABABBA", k=1:** the window grows to "AABA" (4 chars, 3 A's → 1 replacement) = 4. Adding 'B' makes 5 chars with max 3 → needs 2 replacements → slide left. The best stays **4**.

**Complexity:** both O(n) time. Space O(min(n, alphabet size)) for the Map.`,
      questions: [
        { q: 'Why not restart the window from scratch on a duplicate?', a: 'That makes it O(n²). Jumping `left` directly to one past the previous occurrence keeps every pointer moving forward, so the whole thing is O(n).' },
        { q: 'What does the `lastSeen.get(ch) >= left` check protect against?', a: 'A character seen before the current window started. Without the check, `left` could move backwards and include a duplicate, e.g. for "abba" you would get 3 instead of 2.' },
        { q: 'How would you return the substring instead of the length?', a: 'Also store the start index whenever you update `best`, then return `s.slice(bestStart, bestStart + best)`.' },
        { q: 'What is "Minimum Window Substring"?', a: 'Find the smallest window of `s` containing all characters of `t`. Same variable-window template: expand until all needed counts are met, then shrink while still valid, recording the smallest window. O(|s| + |t|).' },
      ],
      spoken: `"For Longest Substring Without Repeating Characters, I use a sliding window with a Map from each character to the last index where I saw it. I move the right pointer one step at a time. If the current character was already seen inside the window, I jump the left pointer to one past that earlier position. Then I record the character's index and update the best length as right minus left plus one. Each pointer only moves forward, so it's O(n) time, and the Map holds at most the alphabet size."`,
      mistakes: [
        'Forgetting the `>= left` check, so `left` moves backwards on inputs like "abba".',
        'Using a Set and clearing it on every duplicate (restart) — O(n²) and easy to get wrong.',
        'Returning the window instead of the length (or vice versa) — read what the problem asks.',
        'Not handling the empty string; the loop should simply return 0.',
        'Follow-up trap: "What if the input is Unicode with emojis?" Iterate with `for...of` / `[...s]` so each code point is one character, and the Map still works because keys can be any string.',
      ],
      takeaway: 'Map char → last index, jump left past a duplicate inside the window, best = right − left + 1.',
    },
    {
      id: 'hashmap-problems-medium',
      title: 'Hashmap Problems: Group Anagrams, Top K Frequent Elements, Product of Array Except Self',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Group by a canonical key, count then bucket by frequency, and use prefix/suffix products instead of division.',
      what: `**1. Group Anagrams** — group words that are anagrams of each other. \`["eat","tea","tan","ate","nat","bat"]\` → \`[["eat","tea","ate"],["tan","nat"],["bat"]]\`.
- Idea: anagrams share the same **canonical key** — the sorted letters (\`"eat"\` → \`"aet"\`). Use a Map from key → list of words. O(n · k log k), where k is the word length.
- Faster key: a 26-count string like \`"1#0#0#...\"\` → O(n · k).

**2. Top K Frequent Elements** — return the k most frequent numbers. \`[1,1,1,2,2,3]\`, k=2 → \`[1,2]\`.
- Simple: count with a Map, sort entries by count → O(n log n).
- Better: **bucket sort** — \`buckets[f]\` holds numbers that appear f times (f is at most n). Walk buckets from high to low until you have k → **O(n)**.
- Heap option: keep a min-heap of size k → O(n log k).

**3. Product of Array Except Self** — \`answer[i]\` = product of all numbers except \`nums[i]\`, **without division**, in O(n). \`[1,2,3,4]\` → \`[24,12,8,6]\`.
- Brute force: for each i multiply all others → O(n²).
- Optimal: \`answer[i] = (product of everything to the left) × (product of everything to the right)\`. One pass left-to-right fills the left products, one pass right-to-left multiplies in the right products. O(n) time, O(1) extra space (the output doesn't count).

#### Deeper version
- Why not divide in problem 3? The problem forbids it, and division breaks with zeros (one zero → only that index is non-zero; two zeros → all zeros).
- Bucket sort works for Top K because counts are bounded by n, so we can index an array by count instead of sorting.
- In JavaScript, \`-0\` can appear in Product Except Self (e.g. \`0 * -1\`). Node prints it as \`-0\`; tests using \`===\` treat \`-0 === 0\` as true, but deep-equal checks may not. Normalising with \`|| 0\` avoids surprises.`,
      why: `These three are on every "top interview questions" list. They test whether you can design a good **key** for grouping, use counts beyond simple lookups, and think in **prefix/suffix** passes — a pattern reused in Trapping Rain Water and many array problems.`,
      analogy: `Group Anagrams is like sorting letters into mailboxes: every word is "stamped" with its letters in alphabetical order, and words with the same stamp go into the same mailbox. Product Except Self is like a relay: one runner carries the product from the left, another carries it from the right, and each position multiplies what both runners bring.`,
      code: [
        {
          title: 'Group Anagrams — Map from sorted key to words',
          lang: 'javascript',
          code: `function groupAnagrams(strs) {
  const groups = new Map(); // "aet" -> ["eat", "tea", "ate"]
  for (const word of strs) {
    const key = [...word].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

console.log(JSON.stringify(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])));
// [["eat","tea","ate"],["tan","nat"],["bat"]]`,
        },
        {
          title: 'Top K Frequent — count + bucket sort, O(n)',
          lang: 'javascript',
          code: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);

  // buckets[f] = numbers that appear exactly f times
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, freq] of count) buckets[freq].push(num);

  const result = [];
  for (let f = buckets.length - 1; f > 0 && result.length < k; f--) {
    for (const num of buckets[f]) {
      result.push(num);
      if (result.length === k) break;
    }
  }
  return result;
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [ 1, 2 ]
console.log(topKFrequent([4, 4, 5, 5, 5, 6], 1)); // [ 5 ]`,
        },
        {
          title: 'Product of Array Except Self — left and right passes',
          lang: 'javascript',
          code: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let left = 1;                      // product of everything left of i
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    left *= nums[i];
  }
  let right = 1;                     // product of everything right of i
  for (let i = n - 1; i >= 0; i--) {
    answer[i] = answer[i] * right || 0; // || 0 turns -0 into 0
    right *= nums[i];
  }
  return answer;
}

console.log(productExceptSelf([1, 2, 3, 4]));       // [ 24, 12, 8, 6 ]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [ 0, 0, 9, 0, 0 ]`,
        },
      ],
      output: `**Group Anagrams:** "eat", "tea", "ate" all get key "aet"; "tan", "nat" get "ant"; "bat" gets "abt". The Map keeps insertion order, so groups come out in the order their first word appeared.

**Top K dry run on \`[1,1,1,2,2,3]\`, k=2:** counts 1→3, 2→2, 3→1. Buckets: [3] has 1, [2] has 2, [1] has 3. Walk from the top: take 1, then 2 → **[1, 2]**.

**Product Except Self dry run on \`[1, 2, 3, 4]\`:**
- Left pass: answer = \`[1, 1, 2, 6]\` (product of everything before each index).
- Right pass from the end with right = 1, 4, 12, 24: index 3 → 6×1 = 6, index 2 → 2×4 = 8, index 1 → 1×12 = 12, index 0 → 1×24 = 24.
- Result **[24, 12, 8, 6]**.

**Complexity:** Group Anagrams O(n · k log k) time, O(n · k) space. Top K O(n) time and space. Product Except Self O(n) time, O(1) extra space.`,
      questions: [
        { q: 'Group Anagrams: how can you avoid sorting each word?', a: 'Build the key from letter counts: a 26-slot count array joined with a separator, like "1#0#2...". That makes key building O(k) instead of O(k log k).' },
        { q: 'Top K Frequent: heap or bucket sort?', a: 'Bucket sort is O(n) because frequency is at most n. A min-heap of size k is O(n log k) and is better when data streams in or k is very small compared to n.' },
        { q: 'Product Except Self: why not compute the total product and divide?', a: 'Division is not allowed by the problem and fails with zeros: dividing by 0 gives Infinity or NaN. The prefix/suffix approach handles zeros naturally.' },
        { q: 'Product Except Self: how is it O(1) extra space?', a: 'The output array does not count as extra space by convention. Apart from it we only keep two variables, `left` and `right`.' },
      ],
      spoken: `"For Group Anagrams I build a canonical key for each word — the sorted letters — and use a Map from key to the list of words, so anagrams land in the same bucket. For Top K Frequent I count with a Map, then put numbers into buckets indexed by frequency and read from the highest bucket down, which is O(n). For Product of Array Except Self, every answer is the product of everything to the left times everything to the right, so I do one left-to-right pass storing prefix products in the output, then one right-to-left pass multiplying in the suffix product. That's O(n) time with no division."`,
      mistakes: [
        'Group Anagrams: using the sorted array itself (not a string) as a Map key — arrays are compared by reference, so nothing groups.',
        'Top K: sorting the whole input array instead of the count entries, or forgetting that ties can be returned in any order.',
        'Product Except Self: using division, which breaks on zeros.',
        'Product Except Self: allocating separate `prefix` and `suffix` arrays and then saying it is O(1) space — that is O(n).',
        'Follow-up trap: "Top K Frequent Words with ties broken alphabetically?" Sort entries by `count desc`, then `word asc` with `localeCompare`, or use a heap with a custom comparator.',
      ],
      takeaway: 'Group by a canonical key, bucket by frequency for O(n) top-k, and use left × right passes instead of division.',
    },
    {
      id: 'kadane-prefix-sums',
      title: 'Maximum Subarray (Kadane) and Prefix Sums (Subarray Sum Equals K)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Kadane: at each index either extend the previous subarray or start fresh. Prefix sums + a Map count subarrays with sum K, even with negatives.',
      what: `**1. Maximum Subarray** — find the contiguous subarray with the largest sum. \`[-2,1,-3,4,-1,2,1,-5,4]\` → 6 (\`[4,-1,2,1]\`).
- Brute force: try every start and end → O(n²) (O(n³) if you re-sum).
- Optimal: **Kadane's algorithm**. Walk once and keep \`current\` = best sum of a subarray **ending here**. At each number decide: extend (\`current + x\`) or start fresh (\`x\`) — whichever is larger. Track the overall best. O(n) time, O(1) space.

**2. Subarray Sum Equals K** — count subarrays whose sum is exactly k. \`[1,1,1]\`, k=2 → 2.
- Brute force: every start/end → O(n²).
- Optimal: **prefix sums + Map**. If the running sum now is \`sum\`, and some earlier prefix was \`sum - k\`, then the part between them sums to k. Keep a Map of "prefix sum → how many times seen". O(n) time and space. Works with **negative numbers** (unlike sliding window).

#### Deeper version
Kadane is the simplest **dynamic programming** example: \`dp[i] = max(nums[i], dp[i-1] + nums[i])\`, and we only keep the previous value, so space is O(1). The rule in words: "a negative running sum can only hurt the future, so drop it."

Start \`best\` and \`current\` at \`nums[0]\`, not 0 — otherwise an all-negative array like \`[-3, -1, -2]\` returns 0 instead of -1.

For prefix sums, seed the Map with \`{0: 1}\`: the empty prefix lets a subarray starting at index 0 be counted. Kadane variants: Maximum Product Subarray (track both max and min because a negative times a negative becomes positive), and Best Time to Buy and Sell Stock (Kadane on daily differences).`,
      why: `Maximum Subarray is a top interview problem and the gateway to DP. Subarray Sum Equals K is the canonical prefix-sum + hashmap problem and the standard answer to "what if there are negatives so sliding window fails?" Together they cover most "best/count contiguous subarray" questions.`,
      analogy: `Kadane is like a road trip where each town gives you or takes away money. You carry a running wallet. If your wallet ever goes negative, it's better to "restart" your trip from the next town with an empty wallet than to carry the debt forward.`,
      code: [
        {
          title: 'Kadane: Maximum Subarray',
          lang: 'javascript',
          code: `function maxSubArray(nums) {
  let current = nums[0]; // best sum of a subarray ending at i
  let best = nums[0];    // best sum seen anywhere
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // start fresh or extend
    best = Math.max(best, current);
  }
  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([-3, -1, -2]));                   // -1
console.log(maxSubArray([5, 4, -1, 7, 8]));               // 23`,
        },
        {
          title: 'Subarray Sum Equals K — prefix sums + Map',
          lang: 'javascript',
          code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); // prefix sum -> count (empty prefix = 0)
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) || 0;     // earlier prefixes that leave exactly k
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 1, 1], 2));     // 2
console.log(subarraySum([1, 2, 3], 3));     // 2 ([1,2] and [3])
console.log(subarraySum([1, -1, 0], 0));    // 3`,
        },
      ],
      output: `**Kadane dry run on \`[-2, 1, -3, 4, -1, 2, 1, -5, 4]\`:**

- -2 → current -2, best -2
- 1 → current 1 (start fresh), best 1
- -3 → current -2, best 1
- 4 → current 4 (start fresh), best 4
- -1 → current 3, best 4
- 2 → current 5, best 5
- 1 → current 6, best **6**
- -5 → current 1, best 6
- 4 → current 5, best 6

For all negatives \`[-3, -1, -2]\` the answer is **-1** (the single largest number), because we started from \`nums[0]\`, not 0.

**Prefix dry run on \`[1, 2, 3]\`, k=3:** prefixes 1, 3, 6. At sum 3: need 0 → seen once → count 1 (\`[1,2]\`). At sum 6: need 3 → seen once → count 2 (\`[3]\`). Answer **2**.

**Complexity:** Kadane O(n) time, O(1) space. Subarray Sum Equals K O(n) time, O(n) space.`,
      questions: [
        { q: 'Explain Kadane\'s algorithm in one sentence.', a: 'At each element, the best subarray ending here is either the element alone or the element added to the best subarray ending at the previous index; track the maximum of those.' },
        { q: 'How do you return the subarray itself, not just the sum?', a: 'Track a `start` index that resets to `i` when you start fresh, and save `bestStart`/`bestEnd` whenever `best` improves.' },
        { q: 'Why can\'t you use a sliding window for Subarray Sum Equals K?', a: 'With negative numbers, shrinking the window can make the sum go up, so you cannot decide which pointer to move. Prefix sums with a Map work for any integers.' },
        { q: 'Why seed the prefix Map with {0: 1}?', a: 'So a subarray that starts at index 0 and sums to k is counted: when the running sum equals k we look for prefix 0, which represents the empty prefix.' },
      ],
      spoken: `"For Maximum Subarray I use Kadane's algorithm. I walk once and keep the best sum of a subarray that ends at the current index. At each number I choose the larger of starting fresh with that number or extending the previous sum. I also track the overall best. It's O(n) time and O(1) space, and I initialise with the first element so all-negative arrays work. For counting subarrays that sum to k, I use prefix sums with a Map: if the current prefix minus k was seen before, those earlier positions start subarrays summing to k. That's O(n) and handles negative numbers."`,
      mistakes: [
        'Initialising `best = 0` in Kadane — an all-negative array then wrongly returns 0.',
        'Resetting `current` to 0 when it goes negative but checking the order wrong, so single-element answers are missed. `Math.max(x, current + x)` avoids this.',
        'Subarray Sum Equals K: adding the current prefix to the Map **before** looking up `sum - k`, which wrongly counts an empty subarray when k is 0.',
        'Forgetting the `{0: 1}` seed and missing subarrays that start at index 0.',
        'Follow-up trap: "Maximum Product Subarray?" Track both the max and min product ending here, because multiplying a negative min by a negative number can become the new max. Swap them when the number is negative.',
      ],
      takeaway: 'Kadane: extend or restart at every index (O(n), O(1)); exact-sum counting with negatives → prefix sums + Map with {0: 1}.',
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Halve a sorted search space each step for O(log n); also works on "the answer" when a yes/no check is monotonic.',
      what: `**Binary search** finds a target in a **sorted** array by looking at the middle element and throwing away the half that cannot contain the target. Each step halves the range, so it takes **O(log n)** steps — about 20 steps for a million items.

Steps:
1. \`lo = 0\`, \`hi = n - 1\`.
2. While \`lo <= hi\`: \`mid = Math.floor((lo + hi) / 2)\`.
3. If \`nums[mid] === target\` → found. If smaller → search right (\`lo = mid + 1\`). If bigger → search left (\`hi = mid - 1\`).
4. If the loop ends → not found (return -1).

#### Deeper version
Binary search is really about a **monotonic condition**: a yes/no question that is "no, no, no, yes, yes, yes" across the range. You binary search for the **first yes**. This unlocks:
- **Lower bound** — first index with \`nums[i] >= target\` (insert position, first occurrence).
- **Binary search on the answer** — "minimum speed to finish in h hours" (Koko Eating Bananas), "minimum capacity to ship in d days": the answer range is sorted even though no array is given; check a candidate in O(n) → O(n log range).
- **Rotated arrays and peaks** — one half is always sorted or always "going up", so you can still discard half.

Templates matter: use \`while (lo <= hi)\` with \`mid ± 1\` for exact search, and \`while (lo < hi)\` with \`hi = mid\` for "first yes" (lower bound). Mixing them causes infinite loops. In other languages \`(lo + hi) / 2\` can overflow, so people write \`lo + Math.floor((hi - lo) / 2)\` — in JS numbers are doubles so overflow isn't a practical issue, but it's good to mention.`,
      why: `Binary search turns O(n) searches into O(log n), and "binary search on the answer" solves many problems that don't look like search at all. It's also famous for off-by-one bugs, so interviewers use it to test careful reasoning about boundaries.`,
      analogy: `The "guess my number between 1 and 100" game. You guess 50; "too high"; you guess 25; "too low"; you guess 37... Every guess cuts the possibilities in half, so you need at most 7 guesses for 100 numbers.`,
      code: [
        {
          title: 'Classic Binary Search (exact match)',
          lang: 'javascript',
          code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; // target is on the right
    else hi = mid - 1;                    // target is on the left
  }
  return -1;
}

console.log(search([-1, 0, 3, 5, 9, 12], 9)); // 4
console.log(search([-1, 0, 3, 5, 9, 12], 2)); // -1`,
        },
        {
          title: 'Lower bound + binary search on the answer',
          lang: 'javascript',
          code: `// First index where nums[i] >= target (also the insert position)
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length;          // hi = n: answer may be "past the end"
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;                       // mid could be the answer, keep it
  }
  return lo;
}
console.log(lowerBound([1, 2, 2, 2, 5], 2)); // 1 (first 2)
console.log(lowerBound([1, 3, 5, 6], 4));    // 2 (insert position)

// Koko Eating Bananas: min speed k to eat all piles within h hours
function minEatingSpeed(piles, h) {
  const hoursNeeded = (k) => piles.reduce((t, p) => t + Math.ceil(p / k), 0);
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hoursNeeded(mid) <= h) hi = mid; // fast enough -> try slower
    else lo = mid + 1;                   // too slow
  }
  return lo;
}
console.log(minEatingSpeed([3, 6, 7, 11], 8)); // 4`,
        },
      ],
      output: `**Dry run — search([-1, 0, 3, 5, 9, 12], 9):** lo=0, hi=5 → mid=2 (3) < 9 → lo=3. mid=4 (9) → found at **4**. For target 2: mid=2 (3) > 2 → hi=1; mid=0 (-1) < 2 → lo=1; mid=1 (0) < 2 → lo=2 > hi → **-1**.

**lowerBound([1, 2, 2, 2, 5], 2):** it keeps moving \`hi\` down onto any 2, so it lands on the **first** 2 at index 1. For 4 in \`[1, 3, 5, 6]\` it returns 2, where 4 would be inserted.

**Koko:** speeds 1..11 are "too slow" up to 3 (needs 10 hours) and "fast enough" from 4 (needs 1+2+2+3 = 8 hours). Binary search finds the first fast-enough speed: **4**.

**Complexity:** search and lowerBound O(log n) time, O(1) space. Koko O(n log m), where m is the largest pile.`,
      questions: [
        { q: 'What is the precondition for binary search?', a: 'The search space must be sorted, or more generally the condition must be monotonic (false...false, true...true), so looking at the middle tells you which half to discard.' },
        { q: 'What is the time complexity and why?', a: 'O(log n), because each step halves the remaining range. After about log2(n) halvings only one element is left.' },
        { q: 'How do you find the first occurrence of a value with duplicates?', a: 'Use lower bound: when `nums[mid] >= target`, set `hi = mid` (keep it as a candidate) instead of returning; loop while `lo < hi`. Then check `nums[lo] === target`.' },
        { q: 'What is "binary search on the answer"?', a: 'When the answer is a number in a range and you can check "is x good enough?" with a monotonic yes/no, binary search over x instead of over an array. Examples: Koko Eating Bananas, ship packages within D days.' },
      ],
      spoken: `"Binary search works on sorted data. I keep low and high pointers, look at the middle, and discard the half that can't contain the target, so it's O(log n) time and O(1) space. I'm careful with the template: for an exact match I loop while low is less than or equal to high and move mid plus or minus one; for a lower bound I loop while low is less than high and set high to mid. Beyond arrays, I use it on the answer itself whenever I can test a candidate with a monotonic yes-or-no check, like the minimum eating speed in Koko Eating Bananas."`,
      mistakes: [
        'Using `while (lo < hi)` with `hi = mid - 1`, or `while (lo <= hi)` with `hi = mid` — mixing templates causes missed answers or infinite loops.',
        'Forgetting `Math.floor` in JavaScript: `(lo + hi) / 2` can be 2.5, and `nums[2.5]` is `undefined`.',
        'Running binary search on unsorted data.',
        'Returning `mid` on the first match when the problem asks for the first or last occurrence.',
        'Follow-up trap: "Find the square root of x (integer part) without Math.sqrt?" Binary search on the answer: find the largest m with m * m <= x in O(log x).',
      ],
      takeaway: 'Sorted or monotonic → binary search in O(log n); pick one template and keep the boundaries consistent.',
    },
    {
      id: 'binary-search-problems',
      title: 'Binary Search Problems: Search in Rotated Sorted Array, Find Minimum in Rotated Array',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'In a rotated sorted array, one half around mid is always sorted — check if the target lies in that half, otherwise go to the other half.',
      what: `A **rotated sorted array** is a sorted array cut at some point and swapped: \`[0,1,2,4,5,6,7]\` rotated becomes \`[4,5,6,7,0,1,2]\`. All values are distinct.

**1. Search in Rotated Sorted Array** — return the index of \`target\`, or -1, in **O(log n)**. \`[4,5,6,7,0,1,2]\`, target 0 → 4.
- Brute force: linear scan → O(n).
- Optimal: modified binary search. At any \`mid\`, **at least one half is sorted**.
- If \`nums[lo] <= nums[mid]\`, the **left half** is sorted. If \`nums[lo] <= target < nums[mid]\`, search left; else search right.
- Otherwise the **right half** is sorted. If \`nums[mid] < target <= nums[hi]\`, search right; else search left.

**2. Find Minimum in Rotated Sorted Array** — \`[3,4,5,1,2]\` → 1.
- Compare \`nums[mid]\` with \`nums[hi]\`. If \`nums[mid] > nums[hi]\`, the drop (the minimum) is to the right of mid → \`lo = mid + 1\`. Otherwise the minimum is at mid or to its left → \`hi = mid\`.

#### Deeper version
Why "one half is sorted": the rotation creates only **one** "drop" point. The drop can be in the left half or the right half, but not both — so the other half is a normal sorted range where a simple \`low <= target < high\` check works.

With **duplicates** (Search in Rotated Sorted Array II), \`nums[lo] === nums[mid] === nums[hi]\` can hide which half is sorted. The fix is to shrink both ends by one (\`lo++\`, \`hi--\`), which makes the worst case O(n). Mention this — it's a common follow-up.`,
      why: `This is the most common "binary search with a twist" question. It checks that you understand **why** binary search works (discarding a half that cannot contain the target), not just the template. It also appears in system contexts like circular buffers and log rotation.`,
      analogy: `A clock face starting at 4: 4, 5, 6, 7, 0, 1, 2. If you look at any point, one side of you counts up normally without wrapping. You check if your number would fit on that normal side; if not, it must be on the other side.`,
      code: [
        {
          title: 'Search in Rotated Sorted Array',
          lang: 'javascript',
          code: `function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // left half [lo..mid] is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half [mid..hi] is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 3)); // -1
console.log(searchRotated([1], 1));                   // 0
console.log(searchRotated([3, 1], 1));                // 1`,
        },
        {
          title: 'Find Minimum in Rotated Sorted Array',
          lang: 'javascript',
          code: `function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1; // the drop is right of mid
    else hi = mid;                          // min is at mid or left of it
  }
  return nums[lo];
}

console.log(findMin([3, 4, 5, 1, 2]));       // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2])); // 0
console.log(findMin([11, 13, 15, 17]));      // 11 (not rotated)`,
        },
      ],
      output: `**Dry run — searchRotated([4,5,6,7,0,1,2], 0):**
- lo=0, hi=6, mid=3 (7). Left half \`[4..7]\` sorted (4 ≤ 7). Is 0 in [4, 7)? No → lo=4.
- lo=4, hi=6, mid=5 (1). \`nums[4]=0 <= 1\` → left half \`[0..1]\` sorted. Is 0 in [0, 1)? Yes → hi=4.
- lo=4, hi=4, mid=4 (0) → found at **4**.

**Edge case \`[3, 1]\`, target 1:** mid=0 (3). Left half \`[3]\` sorted; 1 is not in [3, 3) → lo=1. mid=1 → found at **1**. This is why the check uses \`<=\` in \`nums[lo] <= nums[mid]\` (when lo === mid).

**findMin([3,4,5,1,2]):** mid=2 (5) > nums[hi]=2 → lo=3. mid=3 (1) ≤ 2 → hi=3. lo === hi → **1**.

**Complexity:** both O(log n) time, O(1) space.`,
      questions: [
        { q: 'Why is one half always sorted in a rotated array?', a: 'Rotation creates exactly one "drop" point. Mid splits the array into two halves, and the drop can only be in one of them, so the other half is in normal sorted order.' },
        { q: 'Why compare with nums[hi] (not nums[lo]) in Find Minimum?', a: 'Comparing with `nums[hi]` works for both rotated and non-rotated arrays: if mid is bigger than the right end, the drop is to the right. Comparing with `nums[lo]` fails on non-rotated input without extra checks.' },
        { q: 'What changes if the array has duplicates?', a: 'When `nums[lo] === nums[mid] === nums[hi]` you can\'t tell which half is sorted, so you shrink the ends (`lo++`, `hi--`). The worst case becomes O(n), e.g. `[1,1,1,1,0,1,1]`.' },
        { q: 'Can you solve it by first finding the rotation point?', a: 'Yes: find the index of the minimum with binary search, then do a normal binary search on the correct half. Still O(log n), just two passes.' },
      ],
      spoken: `"In a rotated sorted array, whenever I pick a middle element, at least one half is still normally sorted, because there's only one drop point. So I check if the left half is sorted by comparing the low and middle values. If it is, and the target falls inside that range, I search left; otherwise I search right. If the right half is the sorted one, I do the mirror check. That keeps it O(log n). For finding the minimum, I compare mid with the high end: if mid is bigger, the drop is on the right, otherwise the minimum is at mid or to its left."`,
      mistakes: [
        'Using `<` instead of `<=` in `nums[lo] <= nums[mid]`, which breaks when `lo === mid` (two-element arrays).',
        'Using inclusive bounds on both sides of the target check (`target <= nums[mid]`) — mid was already checked, so use strict inequality on the mid side.',
        'In Find Minimum, writing `hi = mid - 1`, which can skip the minimum itself.',
        'Follow-up trap: "What is the time complexity with duplicates?" Worst case O(n), because equal values at lo, mid and hi force you to shrink one step at a time.',
      ],
      takeaway: 'At any mid, one half of a rotated array is sorted — check if the target fits there, else go to the other half (O(log n)).',
    },
    {
      id: 'linked-lists',
      title: 'Linked Lists',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A chain of nodes where each node points to the next; O(1) insert/delete at a known node, but O(n) to reach the i-th item.',
      what: `A **linked list** is a chain of **nodes**. Each node holds a value and a pointer (\`next\`) to the next node. The first node is the **head**; the last node points to \`null\`.

Compared to an array:
- Access by position is **O(n)** — you must walk from the head.
- Insert or delete at the head, or right after a node you already have, is **O(1)** — just change pointers, nothing shifts.

JavaScript has no built-in linked list, so interview problems give you a \`ListNode\` class: \`{ val, next }\`.

#### Deeper version
Types: **singly** linked (only \`next\`), **doubly** linked (\`next\` and \`prev\`, so you can delete a node in O(1) given just the node), and **circular** (the tail points back to the head).

Common techniques:
- **Dummy (sentinel) head** — a fake node before the real head, so inserting/deleting the first node needs no special case. Return \`dummy.next\`.
- **Fast & slow pointers** — slow moves 1 step, fast moves 2. When fast reaches the end, slow is in the middle. If there is a cycle, they will meet (Floyd's cycle detection).
- **Pointer reversal** — keep \`prev\`, \`curr\`, \`next\` to reverse links in place.
- **Gap of n** — move one pointer n steps ahead, then move both; when the first hits the end, the second is n from the end (Remove Nth Node From End).

Real-world use: an **LRU cache** is a hashmap plus a doubly linked list (O(1) move-to-front and evict-from-back). Queues and browser history can also be built on linked lists.`,
      why: `Linked list problems test pointer handling: losing a reference, off-by-one at the head, or forgetting \`null\` checks. They're a favourite because they need careful step-by-step thinking, and they are the base for LRU cache design questions.`,
      analogy: `A treasure hunt: each clue tells you where the next clue is. To reach clue 10 you must follow clues 1 to 9. But adding a new clue in the middle is easy — just change one clue to point to the new one, and the new one to point onward.`,
      code: [
        {
          title: 'Build, print and walk a linked list',
          lang: 'javascript',
          code: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

// Helpers used in every linked list problem
const fromArray = (arr) => {
  const dummy = new ListNode(0);
  let tail = dummy;
  for (const v of arr) { tail.next = new ListNode(v); tail = tail.next; }
  return dummy.next;
};
const toArray = (head) => {
  const out = [];
  for (let n = head; n; n = n.next) out.push(n.val);
  return out;
};

let head = fromArray([1, 2, 3]);
console.log(toArray(head)); // [ 1, 2, 3 ]

head = new ListNode(0, head);          // insert at head: O(1)
console.log(toArray(head)); // [ 0, 1, 2, 3 ]

// delete the node after the one with value 1: O(1) once we are there
let node = head;
while (node && node.val !== 1) node = node.next; // O(n) to find it
node.next = node.next.next;
console.log(toArray(head)); // [ 0, 1, 3 ]`,
        },
        {
          title: 'Fast & slow pointers: middle of the list',
          lang: 'javascript',
          code: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
const fromArray = (arr) => arr.reduceRight((next, v) => new ListNode(v, next), null);

function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;       // 1 step
    fast = fast.next.next;  // 2 steps
  }
  return slow; // for even length, this is the second middle
}

console.log(middleNode(fromArray([1, 2, 3, 4, 5])).val); // 3
console.log(middleNode(fromArray([1, 2, 3, 4, 5, 6])).val); // 4`,
        },
      ],
      output: `The helpers turn arrays into lists and back so you can test quickly. Inserting \`0\` at the head only creates one node and points it at the old head — O(1). Deleting the node after \`1\` is one pointer change (\`node.next = node.next.next\`), but **finding** that node took a walk, O(n).

For the middle: with 5 nodes, slow moves 2 times and stops on 3 when fast reaches the last node. With 6 nodes, fast falls off the end after 3 moves, and slow is on 4 (the second middle).

**Complexity:** access O(n), insert/delete at a known node O(1), middle-finding O(n) time and O(1) space.`,
      questions: [
        { q: 'Array vs linked list?', a: 'Arrays give O(1) index access and are cache-friendly, but inserting at the front or middle is O(n). Linked lists insert/delete in O(1) at a known node, but access by index is O(n) and each node uses extra memory for pointers.' },
        { q: 'What is a dummy head and why use it?', a: 'A fake node placed before the real head. It removes special cases when the head itself changes (deleting the first node, merging lists). You return `dummy.next` at the end.' },
        { q: 'How do you find the middle in one pass?', a: 'Fast and slow pointers: slow moves one step, fast moves two. When fast reaches the end, slow is at the middle. O(n) time, O(1) space.' },
        { q: 'How would you remove the Nth node from the end in one pass?', a: 'Use a dummy head, move a `fast` pointer n + 1 steps ahead, then move `fast` and `slow` together until `fast` is null. Now `slow.next` is the node to remove: `slow.next = slow.next.next`.' },
      ],
      spoken: `"A linked list is a chain of nodes, each holding a value and a pointer to the next node. Unlike an array, getting the i-th element is O(n) because I have to walk from the head, but inserting or deleting at a node I already have is O(1) because I only change pointers. In interviews I rely on three tricks: a dummy head to avoid special cases at the start, fast and slow pointers for the middle or cycle detection, and prev-curr-next pointers to reverse links in place. A real use is an LRU cache, which combines a hashmap with a doubly linked list."`,
      mistakes: [
        'Losing the rest of the list by changing `curr.next` before saving it in a temporary variable.',
        'Not checking `fast && fast.next` before `fast.next.next`, causing "Cannot read properties of null".',
        'Special-casing the head everywhere instead of using a dummy node.',
        'Saying deletion is O(1) without noting that finding the node is O(n) in a singly linked list.',
        'Follow-up trap: "Delete a node when you are given only that node (not the head)?" Copy the next node\'s value into it and skip the next node: `node.val = node.next.val; node.next = node.next.next`. It does not work for the tail.',
      ],
      takeaway: 'Linked list = pointer surgery: use a dummy head, fast/slow pointers, and always save `next` before rewiring.',
    },
    {
      id: 'linked-list-problems',
      title: 'Linked List Problems: Reverse Linked List, Merge Two Sorted Lists, Linked List Cycle',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Reverse with prev/curr/next, merge with a dummy head and a tail pointer, detect cycles with Floyd\'s fast and slow pointers.',
      what: `**1. Reverse Linked List** — \`1→2→3→4→5\` becomes \`5→4→3→2→1\`.
- Simple: copy values into an array, write them back reversed → O(n) space.
- Optimal (iterative): walk with \`prev = null\` and \`curr = head\`. For each node: save \`next\`, point \`curr.next\` back to \`prev\`, move \`prev\` and \`curr\` forward. O(n) time, O(1) space.
- Recursive version: reverse the rest, then make \`head.next.next = head\` and \`head.next = null\`. O(n) stack space.

**2. Merge Two Sorted Lists** — \`1→2→4\` and \`1→3→4\` → \`1→1→2→3→4→4\`.
- Use a **dummy** node and a \`tail\` pointer. Compare the two heads, attach the smaller, move forward. When one list ends, attach the rest of the other. O(n + m) time, O(1) space (we reuse nodes).

**3. Linked List Cycle** — does the list loop back on itself?
- Simple: store visited nodes in a **Set**; seeing one again means a cycle → O(n) space.
- Optimal: **Floyd's tortoise and hare** — slow moves 1 step, fast moves 2. If there is a cycle, fast eventually laps slow and they meet. If fast reaches \`null\`, no cycle. O(n) time, O(1) space.

#### Deeper version
Why must fast and slow meet in a cycle? Once both are inside the loop, the gap between them shrinks by exactly 1 each step (fast gains one node per move), so the gap reaches 0 — they can't jump over each other.

**Cycle II (find where the cycle starts):** after they meet, put one pointer back at the head and move both one step at a time; they meet at the cycle start. This works because the distance from the head to the start equals the distance from the meeting point to the start (modulo the loop length).

Merge Two Sorted Lists is the "merge" step of merge sort, and the base of **Merge K Sorted Lists** (use a min-heap of the k heads → O(N log k)).`,
      why: `Reverse Linked List is probably the most asked linked list question, and it is a building block for harder ones (Reverse in k-Groups, Palindrome Linked List, Reorder List). Merging and cycle detection teach the dummy-node and fast/slow patterns that solve most of the remaining linked list problems.`,
      analogy: `Reversing a list is like a line of people each pointing at the person in front. You walk down the line and tell each person to turn around and point at the person behind them instead — but before they turn, you note who they were pointing at so you don't lose the rest of the line. Cycle detection is two runners on a track: if the track is a loop, the faster runner will eventually lap the slower one.`,
      code: [
        {
          title: 'Reverse Linked List — iterative and recursive',
          lang: 'javascript',
          code: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
const fromArray = (arr) => arr.reduceRight((next, v) => new ListNode(v, next), null);
const toArray = (h) => { const o = []; for (; h; h = h.next) o.push(h.val); return o; };

function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // 1. save the rest
    curr.next = prev;       // 2. turn the arrow around
    prev = curr;            // 3. move prev forward
    curr = next;            // 4. move curr forward
  }
  return prev;              // prev is the new head
}

function reverseRecursive(head) {
  if (!head || !head.next) return head;   // empty or last node
  const newHead = reverseRecursive(head.next);
  head.next.next = head;                  // the node after me points back to me
  head.next = null;
  return newHead;
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4, 5]))));   // [ 5, 4, 3, 2, 1 ]
console.log(toArray(reverseRecursive(fromArray([1, 2, 3]))));    // [ 3, 2, 1 ]
console.log(toArray(reverseList(null)));                         // []`,
        },
        {
          title: 'Merge Two Sorted Lists — dummy head + tail',
          lang: 'javascript',
          code: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
const fromArray = (arr) => arr.reduceRight((next, v) => new ListNode(v, next), null);
const toArray = (h) => { const o = []; for (; h; h = h.next) o.push(h.val); return o; };

function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b; // attach whatever is left
  return dummy.next;
}

console.log(toArray(mergeTwoLists(fromArray([1, 2, 4]), fromArray([1, 3, 4])))); // [ 1, 1, 2, 3, 4, 4 ]
console.log(toArray(mergeTwoLists(null, fromArray([0]))));                       // [ 0 ]`,
        },
        {
          title: 'Linked List Cycle — Floyd\'s fast and slow pointers',
          lang: 'javascript',
          code: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // same node object -> loop
  }
  return false; // fast reached the end
}

function cycleStart(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;                   // restart one pointer from head
      while (p !== slow) { p = p.next; slow = slow.next; }
      return p;
    }
  }
  return null;
}

// Build 3 -> 2 -> 0 -> -4 -> (back to 2)
const n3 = new ListNode(3), n2 = new ListNode(2), n0 = new ListNode(0), n4 = new ListNode(-4);
n3.next = n2; n2.next = n0; n0.next = n4; n4.next = n2;
console.log(hasCycle(n3));          // true
console.log(cycleStart(n3).val);    // 2
console.log(hasCycle(new ListNode(1, new ListNode(2)))); // false`,
        },
      ],
      output: `**Dry run — reverseList(1→2→3):**
- prev=null, curr=1: save 2, 1.next=null, prev=1, curr=2. List so far: \`1→null\`.
- curr=2: save 3, 2.next=1, prev=2, curr=3. \`2→1→null\`.
- curr=3: save null, 3.next=2, prev=3, curr=null. \`3→2→1→null\`. Return prev = 3.

**Dry run — merge(1→2→4, 1→3→4):** compare 1 vs 1 → take a's 1 (\`<=\` keeps it stable). 2 vs 1 → take 1. 2 vs 3 → take 2. 4 vs 3 → take 3. 4 vs 4 → take a's 4. a is empty → attach b's 4. Result \`1,1,2,3,4,4\`.

**Cycle:** in \`3→2→0→-4→2...\`, slow and fast enter the loop and fast closes the gap by one node per step until they land on the same node → \`true\`. Resetting one pointer to the head and walking both one step at a time meets at node **2**, the start of the loop.

**Complexity:** Reverse O(n) time, O(1) space (recursive O(n) stack). Merge O(n + m) time, O(1) space. Cycle O(n) time, O(1) space.`,
      questions: [
        { q: 'Reverse Linked List: iterative or recursive?', a: 'Iterative is O(1) space and safe for long lists. Recursive is elegant but uses O(n) call-stack space and can overflow on very long lists.' },
        { q: 'Why use a dummy node in Merge Two Sorted Lists?', a: 'The head of the result is unknown at the start. A dummy node gives `tail` something to attach to, so the first node needs no special case. Return `dummy.next`.' },
        { q: 'How does Floyd\'s algorithm detect a cycle with O(1) space?', a: 'Slow moves 1 step and fast moves 2. Without a cycle, fast hits null. With a cycle, once both are inside the loop fast gains one node per step, so it must land on slow.' },
        { q: 'How do you find the node where the cycle begins?', a: 'After slow and fast meet, move one pointer back to the head and advance both one step at a time. The node where they meet is the start of the cycle.' },
        { q: 'How do you check if a linked list is a palindrome in O(1) space?', a: 'Find the middle with fast/slow, reverse the second half, compare it with the first half, and optionally reverse it back.' },
      ],
      spoken: `"To reverse a linked list I keep three pointers: prev, curr and next. For each node I save next, point curr.next back at prev, then move prev and curr forward. When curr is null, prev is the new head. That's O(n) time and O(1) space. To merge two sorted lists I use a dummy head and a tail pointer, always attaching the smaller node and finally attaching the leftover list. For cycle detection I use Floyd's algorithm: slow moves one step, fast moves two, and if they ever point to the same node there's a cycle; if fast hits null, there isn't."`,
      mistakes: [
        'Reverse: writing `curr.next = prev` before saving `curr.next`, which loses the rest of the list.',
        'Reverse: returning `curr` (which is null at the end) instead of `prev`.',
        'Merge: forgetting to attach the remaining list after the loop, so the tail is cut off.',
        'Cycle: comparing values (`slow.val === fast.val`) instead of node identity (`slow === fast`). Different nodes can have the same value.',
        'Follow-up trap: "Merge K sorted lists?" Put the k heads into a min-heap, repeatedly pop the smallest and push its next. O(N log k) where N is the total number of nodes. Merging pairwise in rounds (divide and conquer) is also O(N log k).',
      ],
      takeaway: 'Reverse = prev/curr/next, merge = dummy + tail, cycle = fast/slow meeting — all O(n) time and O(1) space.',
    },
    {
      id: 'trees',
      title: 'Trees, Binary Search Trees and Traversals',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A tree is nodes with children and no cycles; DFS traversals (pre/in/post-order) use recursion, BFS (level order) uses a queue, and a BST keeps left < node < right.',
      what: `A **tree** is a set of nodes connected like a family tree: one **root** at the top, each node has **children**, and there are no loops. A node with no children is a **leaf**.

A **binary tree** means each node has at most two children: \`left\` and \`right\`.

A **binary search tree (BST)** adds a rule: everything in the left subtree is **smaller** than the node, and everything in the right subtree is **larger**. This makes search, insert and delete **O(log n)** when the tree is balanced (like binary search on a tree).

**Traversals** (ways to visit every node):
- **Pre-order** (node, left, right) — copy/serialize a tree.
- **In-order** (left, node, right) — on a BST this gives values in **sorted order**.
- **Post-order** (left, right, node) — delete a tree or compute something from children first (like height).
- **Level-order (BFS)** — level by level using a queue.

#### Deeper version
- **Height** h = number of levels. A balanced tree has h ≈ log n; a "skewed" tree (every node only has a right child, e.g. inserting sorted data into a plain BST) has h = n, so BST operations become O(n). Self-balancing trees (AVL, Red-Black) keep h = O(log n); databases use B-trees / B+ trees, which are wide, shallow balanced trees (MongoDB and Postgres indexes).
- DFS on a tree is O(n) time and **O(h)** space (the recursion stack). BFS is O(n) time and **O(w)** space, where w is the widest level.
- Most tree problems are solved by asking: "If I know the answer for the left and right subtrees, how do I get the answer for this node?" — then write the recursion with a \`null\` base case.
- Other trees you may be asked about: **heap** (complete binary tree for priority queues), **trie** (prefix tree for strings), and the **DOM** itself, which is a tree you traverse in frontend interviews.`,
      why: `Trees are everywhere: the DOM, React's component tree, file systems, JSON, database indexes, and org charts. Tree questions are among the most frequent in interviews because they test recursion, which in turn underlies graphs, backtracking and DP.`,
      analogy: `A company org chart: the CEO is the root, managers are internal nodes, and individual contributors are leaves. Pre-order is a manager introducing themselves before their team. Post-order is collecting reports from the team before the manager reports up. Level-order is calling everyone at each level of the hierarchy, top to bottom.`,
      code: [
        {
          title: 'Traversals: pre, in, post-order (DFS) and level-order (BFS)',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
//        4
//      /   \\
//     2     6
//    / \\   / \\
//   1   3 5   7
const root = new TreeNode(4,
  new TreeNode(2, new TreeNode(1), new TreeNode(3)),
  new TreeNode(6, new TreeNode(5), new TreeNode(7)));

const pre = (n, out = []) => { if (n) { out.push(n.val); pre(n.left, out); pre(n.right, out); } return out; };
const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; };
const post = (n, out = []) => { if (n) { post(n.left, out); post(n.right, out); out.push(n.val); } return out; };

function levelOrderFlat(root) {
  const out = [], queue = root ? [root] : [];
  for (let i = 0; i < queue.length; i++) {   // i works as the queue head
    const n = queue[i];
    out.push(n.val);
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return out;
}

console.log(pre(root).join(' '));            // 4 2 1 3 6 5 7
console.log(inorder(root).join(' '));        // 1 2 3 4 5 6 7 (sorted for a BST)
console.log(post(root).join(' '));           // 1 3 2 5 7 6 4
console.log(levelOrderFlat(root).join(' ')); // 4 2 6 1 3 5 7`,
        },
        {
          title: 'BST search and insert + iterative in-order with a stack',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}

function insert(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}

function search(root, val) {
  let node = root;
  while (node) {
    if (val === node.val) return true;
    node = val < node.val ? node.left : node.right; // discard half the tree
  }
  return false;
}

// In-order without recursion: go left as far as possible, then visit, then go right
function inorderIterative(root) {
  const out = [], stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) { stack.push(curr); curr = curr.left; }
    curr = stack.pop();
    out.push(curr.val);
    curr = curr.right;
  }
  return out;
}

let bst = null;
for (const v of [8, 3, 10, 1, 6, 14]) bst = insert(bst, v);
console.log(search(bst, 6), search(bst, 7)); // true false
console.log(inorderIterative(bst));          // [ 1, 3, 6, 8, 10, 14 ]`,
        },
      ],
      output: `For the tree with root 4:
- **Pre-order** visits the node first: \`4 2 1 3 6 5 7\`.
- **In-order** visits left, node, right: \`1 2 3 4 5 6 7\` — sorted, because this tree is a BST.
- **Post-order** visits children first: \`1 3 2 5 7 6 4\` — the root comes last.
- **Level-order** goes row by row: \`4 2 6 1 3 5 7\`.

In the BST example, searching for 6 goes 8 → left to 3 → right to 6 → found. Searching for 7 goes 8 → 3 → 6 → right is null → false. The iterative in-order uses an explicit stack instead of recursion and still prints the values sorted.

**Complexity:** traversals O(n) time; DFS O(h) space, BFS O(w) space. BST search/insert O(h) — O(log n) if balanced, O(n) if skewed.`,
      questions: [
        { q: 'What is the difference between a binary tree and a BST?', a: 'A binary tree only limits each node to two children. A BST also requires left subtree values < node < right subtree values, which allows O(log n) search when balanced.' },
        { q: 'Which traversal gives sorted output for a BST?', a: 'In-order traversal (left, node, right).' },
        { q: 'DFS vs BFS on a tree — when to use which?', a: 'DFS (recursion) is natural for most problems like height, paths and validation; it uses O(h) space. BFS (queue) is for level-by-level questions — level order, minimum depth, right side view — and uses O(width) space.' },
        { q: 'What is the worst-case time of BST search?', a: 'O(n), when the tree is skewed like a linked list (e.g. inserting sorted values). Balanced trees like AVL or Red-Black keep it O(log n).' },
        { q: 'Why do databases use B-trees instead of BSTs?', a: 'B-tree nodes hold many keys, so the tree is very shallow and each level is one disk/page read. That minimizes slow I/O compared with a tall binary tree.' },
      ],
      spoken: `"A tree is a hierarchy of nodes with a root and no cycles; in a binary tree each node has up to two children. A binary search tree adds the rule that left values are smaller and right values are larger, so search and insert are O(log n) if it's balanced but O(n) if it's skewed. I traverse trees with DFS — pre-order, in-order, or post-order using recursion — or BFS with a queue for level-by-level problems. In-order on a BST gives sorted output. For most tree problems I think: what do I need from the left and right subtrees, and how do I combine it at this node?"`,
      mistakes: [
        'Forgetting the `null` base case in recursive tree functions, leading to "Cannot read properties of null".',
        'Saying BST operations are always O(log n) — only when the tree is balanced.',
        'Confusing depth (distance from the root) with height (levels below a node).',
        'Using `queue.shift()` in BFS on big trees; use an index pointer.',
        'Follow-up trap: "Recursion depth on a skewed tree with 100,000 nodes?" The recursion is 100,000 calls deep and can overflow the JS stack. Use an iterative traversal with an explicit stack or queue.',
      ],
      takeaway: 'Trees = recursion: solve for left and right, combine at the node; in-order on a BST is sorted, BFS uses a queue.',
    },
    {
      id: 'tree-problems-dfs',
      title: 'Tree Problems: Maximum Depth, Invert Binary Tree, Same Tree',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Classic three-line recursions: depth = 1 + max(left, right), invert = swap children recursively, same tree = compare node by node.',
      what: `**1. Maximum Depth of Binary Tree** — the number of nodes on the longest path from the root down to a leaf.
- Recursive (DFS): \`depth(node) = 0\` if null, else \`1 + max(depth(left), depth(right))\`. O(n) time, O(h) space.
- Iterative (BFS): count how many levels a level-order traversal has.

**2. Invert Binary Tree** — mirror the tree: every left child becomes the right child and vice versa.
- Recursive: swap \`left\` and \`right\` at the node, then invert both children. O(n) time, O(h) space.
- Iterative: BFS with a queue, swapping children at each node.

**3. Same Tree** (a common pair) — are two trees identical in shape and values?
- Both null → true. One null or different values → false. Otherwise, both subtrees must be the same.

#### Deeper version
These are all **post-order** or **pre-order** recursions on the pattern "answer for a node = combine(answer for left, answer for right)". Practise saying this out loud; it's how you approach Diameter of Binary Tree (\`leftHeight + rightHeight\` at each node), Balanced Binary Tree (heights differ by ≤ 1 everywhere), Path Sum, and Lowest Common Ancestor.

Same Tree leads into **Subtree of Another Tree**: for each node of the big tree, check \`isSameTree(node, sub)\` → O(n · m), or serialize both trees and use string search for O(n + m).

**Minimum depth** is a trap: if a node has only one child, you cannot take \`min(left, right)\` because the missing side is 0 and is not a leaf. BFS that stops at the first leaf is the clean answer.`,
      why: `These are the most common warm-up tree questions. They are short, so interviewers expect clean recursion and a correct explanation of time and space (especially O(h) stack space). Invert Binary Tree is famous from a viral tweet about a Homebrew author failing it.`,
      analogy: `Maximum depth is like asking each manager in an org chart, "how many levels are under you?" Each manager asks their two reports, takes the bigger answer, and adds one for themselves. Inverting a tree is holding a family-tree poster up to a mirror.`,
      code: [
        {
          title: 'Maximum Depth — DFS and BFS',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
//     3
//    / \\
//   9  20
//      / \\
//     15  7
const root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));

function maxDepth(node) {
  if (!node) return 0;                                   // empty tree has depth 0
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

function maxDepthBFS(root) {
  if (!root) return 0;
  let level = [root], depth = 0;
  while (level.length) {
    depth++;
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return depth;
}

console.log(maxDepth(root));    // 3
console.log(maxDepthBFS(root)); // 3
console.log(maxDepth(null));    // 0`,
        },
        {
          title: 'Invert Binary Tree and Same Tree',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
const levelValues = (root) => {
  const out = [], q = root ? [root] : [];
  for (let i = 0; i < q.length; i++) {
    out.push(q[i].val);
    if (q[i].left) q.push(q[i].left);
    if (q[i].right) q.push(q[i].right);
  }
  return out;
};

function invertTree(node) {
  if (!node) return null;
  [node.left, node.right] = [node.right, node.left]; // swap children
  invertTree(node.left);
  invertTree(node.right);
  return node;
}

function isSameTree(p, q) {
  if (!p && !q) return true;               // both empty
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

//      4                4
//    /   \\            /   \\
//   2     7    ->    7     2
//  / \\   / \\        / \\   / \\
// 1   3 6   9      9   6 3   1
const tree = new TreeNode(4,
  new TreeNode(2, new TreeNode(1), new TreeNode(3)),
  new TreeNode(7, new TreeNode(6), new TreeNode(9)));
console.log(levelValues(invertTree(tree))); // [ 4, 7, 2, 9, 6, 3, 1 ]

const a = new TreeNode(1, new TreeNode(2), new TreeNode(3));
const b = new TreeNode(1, new TreeNode(2), new TreeNode(3));
const c = new TreeNode(1, new TreeNode(2));
console.log(isSameTree(a, b), isSameTree(a, c)); // true false`,
        },
      ],
      output: `**Dry run — maxDepth on the tree [3, 9, 20, 15, 7]:**
- maxDepth(9) = 1 + max(0, 0) = 1.
- maxDepth(15) = 1, maxDepth(7) = 1 → maxDepth(20) = 1 + max(1, 1) = 2.
- maxDepth(3) = 1 + max(1, 2) = **3**.
The BFS version counts levels: [3], [9, 20], [15, 7] → 3.

**Invert:** at 4, swap children → 7 on the left, 2 on the right. Then inside 7 swap 6 and 9, inside 2 swap 1 and 3. Level order becomes \`[4, 7, 2, 9, 6, 3, 1]\`.

**Same Tree:** \`a\` and \`b\` match at every node → true. \`c\` has no right child where \`a\` has 3 → false.

**Complexity:** all three are O(n) time (each node visited once) and O(h) space for recursion (O(w) for the BFS version).`,
      questions: [
        { q: 'What is the space complexity of recursive maxDepth?', a: 'O(h), the height of the tree, for the call stack. That is O(log n) for a balanced tree and O(n) for a skewed one.' },
        { q: 'Can you invert a tree iteratively?', a: 'Yes. Use a queue (BFS) or a stack (DFS): pop a node, swap its left and right children, and push the non-null children. Same O(n) time.' },
        { q: 'How would you find the diameter of a binary tree?', a: 'Compute heights with a post-order DFS; at each node the longest path through it is `leftHeight + rightHeight` edges. Track the maximum in an outer variable. O(n).' },
        { q: 'How do you check if a tree is balanced in O(n)?', a: 'Post-order DFS that returns the height, or -1 if a subtree is unbalanced. If any child returns -1 or the heights differ by more than 1, return -1 upward.' },
      ],
      spoken: `"Most easy tree problems are a few lines of recursion. For maximum depth, an empty node has depth zero, and any other node is one plus the larger depth of its two children. For inverting a tree, I swap the left and right children at the current node and then recursively invert both children. For Same Tree, two null nodes are equal, a null and a non-null or different values are not, and otherwise both pairs of subtrees must match. Each visits every node once, so O(n) time, and O(h) stack space where h is the height."`,
      mistakes: [
        'Returning 1 for a null node in maxDepth, which adds an extra level to every answer.',
        'Invert: assigning `node.left = invertTree(node.right)` and then `node.right = invertTree(node.left)` — the second line uses the already-changed `left`. Swap first, or save one side in a temp variable.',
        'Same Tree: only comparing values in a traversal array — different shapes can give the same traversal (e.g. `[1, 2]` as a left child vs a right child).',
        'Follow-up trap: "Minimum depth — just use min instead of max?" No. A node with one child is not a leaf; `min` would return the empty side. Handle one-child nodes separately or use BFS and stop at the first leaf.',
      ],
      takeaway: 'Ask "what do I need from left and right?" — depth = 1 + max, invert = swap + recurse, same = compare + recurse.',
    },
    {
      id: 'tree-problems-bfs-bst',
      title: 'Tree Problems: Level Order Traversal, Validate BST, Lowest Common Ancestor of a BST',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Level order = BFS processing one level at a time; Validate BST = pass down (min, max) bounds; LCA in a BST = walk until the values split.',
      what: `**1. Binary Tree Level Order Traversal** — return values level by level: \`[[3], [9, 20], [15, 7]]\`.
- BFS with a queue. At the start of each round, the queue holds exactly one level. Record its size, pop that many nodes, push their children. O(n) time, O(w) space.

**2. Validate Binary Search Tree** — is the tree a valid BST? Every node in the left subtree must be **smaller** than the node, and every node in the right subtree **larger** — not just the direct children.
- Wrong approach: only check \`node.left.val < node.val < node.right.val\`. It misses deeper violations.
- Correct: DFS passing allowed bounds \`(min, max)\`. Going left, the max becomes the node's value; going right, the min becomes the node's value. O(n) time, O(h) space.
- Alternative: in-order traversal must be **strictly increasing**.

**3. Lowest Common Ancestor of a BST** (common bonus) — the deepest node that has both \`p\` and \`q\` in its subtree.
- If both values are smaller than the node, go left; if both are larger, go right; otherwise this node is where they split → it's the LCA. O(h) time, O(1) space.

#### Deeper version
Level-order variants all use the same "process one level per loop" skeleton: **Right Side View** (last node of each level), **Zigzag** (reverse every other level), **Average of Levels**, **Minimum Depth** (stop at the first leaf).

For Validate BST, use \`-Infinity\` / \`Infinity\` (or \`null\`) as starting bounds, not \`Number.MIN_SAFE_INTEGER\`, so node values at the limits still work. BSTs here usually require **strict** inequality (no duplicates); ask the interviewer.

For LCA in a **general binary tree** (not BST), recurse: if the node is null, p or q, return it; get results from left and right; if both are non-null, this node is the LCA; otherwise return the non-null one. O(n).`,
      why: `Level Order Traversal is the template for every BFS-on-a-tree question. Validate BST is a classic trap question — most candidates first write the "only check children" version — so it tests whether you really understand the BST property. LCA is a frequent follow-up in the same interview.`,
      analogy: `Level order is like an elevator stopping at each floor of a building: you meet everyone on floor 1, then everyone on floor 2. Validate BST is like house prices on a street that must stay within a range given by the neighbourhood rules: every house on the left side of the landmark must be cheaper than the landmark, even houses deep down the side street.`,
      code: [
        {
          title: 'Level Order Traversal (BFS, one level per loop)',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
const root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));

function levelOrder(root) {
  const result = [];
  let queue = root ? [root] : [];
  while (queue.length) {
    const level = [], next = [];
    for (const node of queue) {            // the queue holds exactly one level
      level.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    result.push(level);
    queue = next;                          // move to the next level
  }
  return result;
}

console.log(JSON.stringify(levelOrder(root))); // [[3],[9,20],[15,7]]
console.log(JSON.stringify(levelOrder(null))); // []

// Variant: right side view = last value of each level
const rightSideView = (r) => levelOrder(r).map((level) => level.at(-1));
console.log(rightSideView(root)); // [ 3, 20, 7 ]`,
        },
        {
          title: 'Validate BST (bounds) and LCA of a BST',
          lang: 'javascript',
          code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}

function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;   // outside allowed range
  return isValidBST(node.left, min, node.val) &&          // left: below node
         isValidBST(node.right, node.val, max);           // right: above node
}

//     5
//    / \\
//   4   6
//      / \\
//     3   7      <- 3 is in the RIGHT subtree of 5, so this is NOT a BST
const bad = new TreeNode(5, new TreeNode(4), new TreeNode(6, new TreeNode(3), new TreeNode(7)));
const good = new TreeNode(2, new TreeNode(1), new TreeNode(3));
console.log(isValidBST(good)); // true
console.log(isValidBST(bad));  // false

function lowestCommonAncestorBST(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;       // both on the left
    else if (p > node.val && q > node.val) node = node.right; // both on the right
    else return node;                                         // they split here
  }
  return null;
}

//        6
//      /   \\
//     2     8
//    / \\   / \\
//   0   4 7   9
const bst = new TreeNode(6,
  new TreeNode(2, new TreeNode(0), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9)));
console.log(lowestCommonAncestorBST(bst, 2, 8).val); // 6
console.log(lowestCommonAncestorBST(bst, 2, 4).val); // 2`,
        },
      ],
      output: `**Level order dry run:** queue \`[3]\` → level \`[3]\`, next \`[9, 20]\`. Queue \`[9, 20]\` → level \`[9, 20]\`, next \`[15, 7]\`. Queue \`[15, 7]\` → level \`[15, 7]\`, next empty → done: \`[[3],[9,20],[15,7]]\`. The right side view takes the last value of each level: \`[3, 20, 7]\`.

**Validate BST dry run on \`bad\`:** 5 is in (-∞, ∞) ✓. Left 4 must be in (-∞, 5) ✓. Right 6 must be in (5, ∞) ✓. 6's left child 3 must be in (5, 6) ✗ → **false**. Checking only parent/child pairs would say "3 < 6, fine" and wrongly return true.

**LCA:** for 2 and 8, at 6 one value is smaller and one is larger → they split at **6**. For 2 and 4, at 6 both are smaller → go left to 2; at 2, value 2 equals p → return **2** (a node can be its own ancestor).

**Complexity:** level order O(n) time, O(w) space. Validate BST O(n) time, O(h) space. LCA of BST O(h) time, O(1) space.`,
      questions: [
        { q: 'Why is checking each node against its children not enough to validate a BST?', a: 'The BST rule applies to whole subtrees. A grandchild in the right subtree can be smaller than the root while still being smaller than its own parent, e.g. 3 under 6 under 5. Passing min/max bounds catches this.' },
        { q: 'How else can you validate a BST?', a: 'Do an in-order traversal and check each value is strictly greater than the previous one. If any value is ≤ the previous, it is not a BST. O(n) time.' },
        { q: 'How does level order know where one level ends?', a: 'Process the queue in rounds: at the start of each round the queue contains exactly the current level, so take its length (or swap in a new `next` array) before adding children.' },
        { q: 'How do you find the LCA in a normal binary tree (not a BST)?', a: 'Recursively search both sides. If a node is p or q, return it. If both the left and right calls return a node, the current node is the LCA; otherwise pass up whichever side is non-null. O(n).' },
      ],
      spoken: `"For level order traversal I use BFS. Each loop processes exactly one level: I walk the current queue, record the values, and collect the children into the next level. That gives a list of levels in O(n) time. To validate a BST, I don't just compare a node with its children, because the rule applies to entire subtrees. I pass down a min and max bound: going left, the current value becomes the max; going right, it becomes the min. Any node outside its range fails. For LCA in a BST, I walk down until p and q are on different sides."`,
      mistakes: [
        'Validate BST: comparing only with direct children.',
        'Validate BST: using `<` / `>` instead of `<=` / `>=` for the bounds, which allows duplicates when the problem wants strict ordering.',
        'Level order: pushing children into the same array you are iterating with `for...of` and mixing levels — keep a separate `next` array or fix the level size first.',
        'LCA: forgetting that a node can be its own ancestor (if p is an ancestor of q, the answer is p).',
        'Follow-up trap: "Kth smallest element in a BST?" Do an in-order traversal and stop at the kth visited node. O(h + k) time with an iterative stack.',
      ],
      takeaway: 'Level order = BFS one level per loop; validate a BST with (min, max) bounds, not just parent-child checks.',
    },
    {
      id: 'intervals',
      title: 'Interval Problems: Merge Intervals, Insert Interval, Meeting Rooms',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Sort intervals by start, then walk once: overlap if the next start is <= the current end, so extend; otherwise start a new interval.',
      what: `An **interval** is a pair \`[start, end]\`, like a meeting from 9 to 11. Two intervals **overlap** when one starts before the other ends: \`b.start <= a.end\` (after sorting by start).

**1. Merge Intervals** — merge all overlapping intervals. \`[[1,3],[2,6],[8,10],[15,18]]\` → \`[[1,6],[8,10],[15,18]]\`.
- Brute force: compare every pair repeatedly until nothing merges → O(n²) or worse.
- Optimal: **sort by start**. Walk once. If the current interval overlaps the last merged one, extend its end with \`Math.max\`. Otherwise push it as a new interval. O(n log n) time (the sort), O(n) for the output.

**2. Insert Interval** — the list is already sorted and non-overlapping; insert a new one and merge. Three phases in one pass: copy intervals that end before the new one, merge all that overlap it, copy the rest. O(n).

**3. Meeting Rooms** — can one person attend all meetings? Sort by start; if any meeting starts before the previous one ends → false. **Meeting Rooms II** (minimum rooms needed) uses sorted start times and end times with two pointers, or a min-heap of end times.

#### Deeper version
Why sorting makes one pass enough: after sorting by start, an interval can only overlap the **most recent** merged interval — every earlier merged interval ends before that one starts. So you only ever compare with the last item in the result.

Use \`Math.max(last.end, cur.end)\` because a later interval can be fully inside the last one (\`[1,10]\` and \`[2,3]\`).

Ask whether touching intervals (\`[1,2]\` and \`[2,3]\`) count as overlapping. In Merge Intervals they do (\`<=\`); in Meeting Rooms, a meeting ending at 2 and one starting at 2 usually do **not** conflict (\`<\`).

Real-world uses: calendar free/busy slots, booking systems, merging time ranges in logs, and coupon or subscription periods in billing systems.`,
      why: `Interval questions are very common (Merge Intervals is a top-20 question) and map directly to product features like calendars, bookings and scheduling. They test the "sort first, then one greedy pass" idea and careful boundary handling.`,
      analogy: `Imagine painting stripes on a long wall from a list of jobs. If you sort the jobs by where they start, you just keep painting forward: if the next job starts before your current stripe ends, you extend the stripe; if there's a gap, you start a new stripe.`,
      code: [
        {
          title: 'Merge Intervals — sort by start, extend or push',
          lang: 'javascript',
          code: `function merge(intervals) {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const result = [[...sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const [start, end] = sorted[i];
    if (start <= last[1]) last[1] = Math.max(last[1], end); // overlap: extend
    else result.push([start, end]);                         // gap: new interval
  }
  return result;
}

console.log(JSON.stringify(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))); // [[1,6],[8,10],[15,18]]
console.log(JSON.stringify(merge([[1, 4], [4, 5]])));                    // [[1,5]]
console.log(JSON.stringify(merge([[1, 10], [2, 3], [4, 5]])));           // [[1,10]]`,
        },
        {
          title: 'Insert Interval and Meeting Rooms',
          lang: 'javascript',
          code: `function insert(intervals, newInterval) {
  const result = [];
  let [start, end] = newInterval;
  let i = 0;
  // 1. intervals that end before the new one starts
  while (i < intervals.length && intervals[i][1] < start) result.push(intervals[i++]);
  // 2. intervals that overlap the new one -> merge
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  // 3. the rest
  while (i < intervals.length) result.push(intervals[i++]);
  return result;
}
console.log(JSON.stringify(insert([[1, 3], [6, 9]], [2, 5]))); // [[1,5],[6,9]]

// Can one person attend every meeting?
function canAttendMeetings(meetings) {
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false; // starts before previous ends
  }
  return true;
}
console.log(canAttendMeetings([[0, 30], [5, 10], [15, 20]])); // false
console.log(canAttendMeetings([[7, 10], [2, 4]]));            // true

// Minimum rooms: sort starts and ends separately, sweep with two pointers
function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0, maxRooms = 0, e = 0;
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;  // need a new room
    else e++;                          // a meeting ended, reuse its room
    maxRooms = Math.max(maxRooms, rooms);
  }
  return maxRooms;
}
console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2`,
        },
      ],
      output: `**Dry run — merge([[1,3],[2,6],[8,10],[15,18]]):** already sorted. Start with \`[1,3]\`. \`[2,6]\`: 2 ≤ 3 → extend to \`[1,6]\`. \`[8,10]\`: 8 > 6 → push. \`[15,18]\`: 15 > 10 → push. Result \`[[1,6],[8,10],[15,18]]\`.

\`[[1,4],[4,5]]\` merges into \`[[1,5]]\` because touching counts as overlapping here. \`[[1,10],[2,3],[4,5]]\` stays \`[[1,10]]\` thanks to \`Math.max\`.

**Insert \`[2,5]\` into \`[[1,3],[6,9]]\`:** no interval ends before 2. \`[1,3]\` overlaps → merged becomes \`[1,5]\`. \`[6,9]\` starts after 5 → copied. Result \`[[1,5],[6,9]]\`.

**Meeting rooms:** \`[5,10]\` starts before \`[0,30]\` ends → one person can't attend all. The sweep finds at most 2 meetings running at once → **2 rooms**.

**Complexity:** Merge O(n log n) time, O(n) space. Insert O(n). Meeting Rooms I and II O(n log n).`,
      questions: [
        { q: 'Why sort by start time?', a: 'After sorting, any interval can only overlap the most recently merged interval, so one pass comparing with the last result is enough. Without sorting you would need to compare every pair.' },
        { q: 'Why use Math.max when extending the end?', a: 'The next interval may be completely inside the current one, like `[2,3]` inside `[1,10]`. Taking its end directly would shrink the merged interval.' },
        { q: 'What is the complexity of Merge Intervals?', a: 'O(n log n) for sorting plus O(n) for the pass, so O(n log n) time, and O(n) space for the result (plus the sort).' },
        { q: 'How do you find the minimum number of meeting rooms?', a: 'Sort start times and end times separately and sweep: a start before the earliest unfinished end needs a new room; otherwise a room frees up. Or keep a min-heap of end times. O(n log n).' },
      ],
      spoken: `"For Merge Intervals I first sort by start time. Then I walk through once, keeping a result list. If the current interval starts at or before the end of the last merged interval, they overlap, so I extend the end with the max of both ends. Otherwise there's a gap and I push the current interval as a new one. Sorting makes this work because an interval can only overlap the latest merged one. It's O(n log n) because of the sort. The same sort-then-sweep idea solves Insert Interval and Meeting Rooms."`,
      mistakes: [
        'Forgetting to sort, or sorting with `sort()` without a comparator.',
        'Setting `last[1] = end` instead of `Math.max(last[1], end)` and shrinking a merged interval.',
        'Mutating the input intervals by pushing the original arrays into the result and then changing them — copy them if the caller still needs the input.',
        'Mixing up `<` and `<=` for touching intervals; ask the interviewer which one they want.',
        'Follow-up trap: "What if intervals arrive one at a time (a stream)?" Keep them in a sorted structure (balanced BST / sorted array with binary search) and merge with neighbours on insert — about O(log n) to find the position plus the merge work.',
      ],
      takeaway: 'Sort by start, then one pass: overlap → extend the end with max, gap → push a new interval.',
    },
    {
      id: 'graphs',
      title: 'Graphs: Representation, BFS and DFS',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'A graph is nodes connected by edges; store it as an adjacency list and explore it with BFS (queue, shortest path) or DFS (stack/recursion), always tracking visited nodes.',
      what: `A **graph** is a set of **nodes** (also called vertices) connected by **edges**. Unlike a tree, a graph can have **cycles** and no single root.

Types:
- **Undirected** (friendship: A–B goes both ways) or **directed** (follow on Twitter: A → B).
- **Weighted** (roads with distances) or **unweighted**.

How to store it — the **adjacency list**: a Map from each node to the list of its neighbours. \`{ A: [B, C], B: [A], C: [A] }\`. Grids (2D arrays) are graphs too: each cell's neighbours are up, down, left, right.

How to explore it:
- **BFS** (breadth-first search) — use a **queue**; visit all neighbours first, then their neighbours. Finds the **shortest path in an unweighted graph**.
- **DFS** (depth-first search) — use **recursion** or a **stack**; go as deep as possible, then back up. Good for "explore everything connected", cycle detection, and paths.

Always keep a **visited** Set, or you will loop forever on cycles.

#### Deeper version
- Complexity of BFS and DFS: **O(V + E)** time (V = vertices, E = edges), O(V) space for visited + queue/stack.
- **Adjacency matrix** (\`matrix[i][j] = 1\` if there's an edge) uses O(V²) space but gives O(1) edge checks — only good for dense graphs.
- Mark nodes visited **when you add them to the queue**, not when you remove them, so each node enters the queue once.
- **Connected components**: loop over all nodes, start a DFS/BFS from each unvisited one, count how many times you start.
- **Topological sort** (order tasks so each comes after its dependencies) works on directed acyclic graphs (DAGs): Kahn's algorithm with in-degrees + a queue. If not all nodes get ordered, there is a cycle.
- **Weighted shortest path** needs **Dijkstra** (min-heap, O((V + E) log V)), not plain BFS. Union-Find (disjoint set) is another tool for connectivity questions.

Real examples: social networks, route maps, package dependency graphs (npm, build tools), microservice call graphs, web crawlers.`,
      why: `Graph questions (islands, course schedules, word ladders, clone graph, network delay) are standard at mid and senior levels. The good news: almost all of them are BFS or DFS with a visited set on top of an adjacency list or grid — once you know the template, they become routine.`,
      analogy: `BFS is like ripples from a stone in a pond: first the circle 1 metre away, then 2 metres, then 3 — so the first time a ripple touches something, that's the shortest distance. DFS is like exploring a maze by always taking the first unexplored corridor until you hit a dead end, then walking back to the last junction.`,
      code: [
        {
          title: 'Build an adjacency list, then BFS and DFS',
          lang: 'javascript',
          code: `// Undirected edges
const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']];
const graph = new Map();
for (const [u, v] of edges) {
  if (!graph.has(u)) graph.set(u, []);
  if (!graph.has(v)) graph.set(v, []);
  graph.get(u).push(v);
  graph.get(v).push(u); // remove this line for a directed graph
}

function bfs(start) {
  const order = [], visited = new Set([start]), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    order.push(node);
    for (const next of graph.get(node)) {
      if (!visited.has(next)) { visited.add(next); queue.push(next); } // mark on enqueue
    }
  }
  return order;
}

function dfs(node, visited = new Set(), order = []) {
  visited.add(node);
  order.push(node);
  for (const next of graph.get(node)) {
    if (!visited.has(next)) dfs(next, visited, order);
  }
  return order;
}

console.log(bfs('A').join(' ')); // A B C D E
console.log(dfs('A').join(' ')); // A B D C E`,
        },
        {
          title: 'Shortest path length (BFS) and counting connected components',
          lang: 'javascript',
          code: `function shortestPath(graph, start, target) {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (node === target) return dist.get(node);
    for (const next of graph[node] || []) {
      if (!dist.has(next)) { dist.set(next, dist.get(node) + 1); queue.push(next); }
    }
  }
  return -1;
}

const g = { 1: [2, 3], 2: [1, 4], 3: [1, 4], 4: [2, 3, 5], 5: [4], 6: [7], 7: [6] };
console.log(shortestPath(g, '1', '5')); // -1 (keys are strings, neighbours are numbers!)
console.log(shortestPath(g, 1, 5));     // 3

function countComponents(graph) {
  const visited = new Set();
  let count = 0;
  const explore = (n) => {
    visited.add(n);
    for (const next of graph[n] || []) if (!visited.has(next)) explore(next);
  };
  for (const key of Object.keys(graph)) {
    const node = Number(key);              // object keys are strings
    if (!visited.has(node)) { count++; explore(node); }
  }
  return count;
}
console.log(countComponents(g)); // 2 ({1,2,3,4,5} and {6,7})`,
        },
      ],
      output: `**BFS from A:** visit A, queue its neighbours B, C. Visit B → add D. Visit C → D already seen. Visit D → add E. Visit E. Order: \`A B C D E\` — layer by layer.

**DFS from A:** go to B, from B go deep to D, from D to C (A is visited), back to D, then E. Order: \`A B D C E\`.

**shortestPath:** the first call returns \`-1\` because the target is the **string** \`'5'\`, while the nodes reached through the neighbour lists are the **numbers** 1..7, so \`node === target\` is never true — a real JavaScript bug worth mentioning (plain object keys are always strings). With numbers, the path 1 → 2 → 4 → 5 has length **3**. \`countComponents\` converts the string keys back to numbers and finds 2 groups.

**Complexity:** BFS and DFS are O(V + E) time and O(V) space.`,
      questions: [
        { q: 'BFS vs DFS — when do you use which?', a: 'BFS for shortest path in unweighted graphs and level-by-level questions. DFS for exploring all connected nodes, detecting cycles, topological sort and backtracking-style path search. Both are O(V + E).' },
        { q: 'Adjacency list vs adjacency matrix?', a: 'A list uses O(V + E) space and is best for sparse graphs (most real graphs). A matrix uses O(V²) space but answers "is there an edge between i and j?" in O(1); it suits small dense graphs.' },
        { q: 'Why do we need a visited set?', a: 'Graphs can have cycles. Without tracking visited nodes, BFS/DFS would revisit nodes forever or do exponential repeated work.' },
        { q: 'How do you detect a cycle in a directed graph?', a: 'DFS with three states: unvisited, visiting (on the current path), done. Reaching a "visiting" node means a cycle. Or run Kahn\'s topological sort; if not every node is processed, there is a cycle.' },
        { q: 'Does BFS find the shortest path in a weighted graph?', a: 'No. BFS counts edges, not weights. Use Dijkstra\'s algorithm with a min-heap for non-negative weights, or Bellman-Ford if weights can be negative.' },
      ],
      spoken: `"A graph is a set of nodes connected by edges, possibly with cycles. I usually store it as an adjacency list — a Map from each node to its neighbours. To explore it I use BFS with a queue when I need the shortest path in an unweighted graph or level-by-level processing, and DFS with recursion or a stack when I need to explore everything connected, detect cycles, or do a topological sort. In both cases I keep a visited set and mark nodes when I first discover them. Both run in O(V plus E) time. For weighted shortest paths I'd switch to Dijkstra with a priority queue."`,
      mistakes: [
        'Forgetting the visited set and looping forever on a cycle.',
        'Marking nodes visited only when dequeued in BFS, so the same node is queued many times.',
        'Mixing string and number node ids — plain object keys are always strings, while Map and Set keep the real type.',
        'Building only one direction of the edges for an undirected graph.',
        'Follow-up trap: "Is recursive DFS safe on a graph with 100,000 nodes in a long chain?" It can overflow the call stack in JavaScript. Use an iterative DFS with an explicit stack or BFS.',
      ],
      takeaway: 'Adjacency list + visited set; BFS (queue) for shortest unweighted paths, DFS (recursion/stack) for exploring — both O(V + E).',
    },
    {
      id: 'graph-problems',
      title: 'Graph Problems: Number of Islands, Course Schedule (Topological Sort)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Islands = count how many times you start a DFS/BFS on unvisited land; Course Schedule = detect a cycle with Kahn\'s topological sort.',
      what: `**1. Number of Islands** — a grid of \`'1'\` (land) and \`'0'\` (water). Count the islands (groups of land connected up/down/left/right).
- Approach: scan every cell. When you find land that is not visited yet, that's a **new island** → count++, then **flood fill** it (DFS or BFS) to mark all its connected land as visited. O(rows × cols) time.
- Visited marking: either a separate \`visited\` grid/Set, or **sink** the land by changing \`'1'\` to \`'0'\` (changes the input — say so).

**2. Course Schedule** — \`numCourses\` and pairs \`[a, b]\` meaning "to take a you must first take b". Can you finish all courses? It's possible **only if the dependency graph has no cycle**.
- Approach (**Kahn's algorithm / topological sort**): count each course's **in-degree** (how many prerequisites it has). Put all courses with in-degree 0 in a queue. Take one, "finish" it, and lower the in-degree of courses that depended on it; any that reach 0 join the queue. If you finish all courses → true, otherwise a cycle blocked some → false. O(V + E).
- **Course Schedule II** asks for the order itself — it's the order in which courses leave the queue.

#### Deeper version
Number of Islands is the template for all "connected regions in a grid" problems: Max Area of Island, Surrounded Regions, Pacific Atlantic Water Flow, Rotting Oranges (multi-source BFS: put all rotten oranges in the queue at minute 0). Recursive DFS on a 1000×1000 all-land grid can go a million calls deep and overflow the JS stack — BFS or an explicit stack is safer for big grids. Union-Find is a third way to count islands.

Course Schedule can also be solved with DFS and three colours (0 = unvisited, 1 = in the current path, 2 = done). Reaching a node that is "in the current path" means a cycle. Topological sort shows up in real life as build systems, package managers (install dependencies before dependents), task schedulers, and spreadsheet cell recalculation.`,
      why: `Number of Islands is one of the most asked questions at big tech companies; it checks that you can treat a grid as a graph and avoid revisiting cells. Course Schedule is the classic cycle-detection / dependency-ordering problem, and it maps directly to engineering work like build pipelines and job dependencies.`,
      analogy: `Islands: you fly over a map with a paint bucket. Every time you spot unpainted land, you count one island and pour paint that spreads over all connected land, so you never count that island again. Course Schedule: getting dressed — socks before shoes, shirt before tie. Start with items that need nothing first; each time you put one on, items waiting on it get closer to ready. If two items each need the other first, you're stuck — that's a cycle.`,
      code: [
        {
          title: 'Number of Islands — flood fill with DFS (and a BFS version)',
          lang: 'javascript',
          code: `function numIslands(gridInput) {
  const grid = gridInput.map((row) => [...row]); // copy so we don't change the input
  const rows = grid.length, cols = grid[0].length;
  let islands = 0;

  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';                      // mark visited by sinking it
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { islands++; sink(r, c); } // new island found
    }
  }
  return islands;
}

// BFS flood fill: safe for very large islands (no deep recursion)
function numIslandsBFS(gridInput) {
  const grid = gridInput.map((row) => [...row]);
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      islands++;
      grid[r][c] = '0';
      const queue = [[r, c]];
      for (let i = 0; i < queue.length; i++) {
        const [cr, cc] = queue[i];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === '1') {
            grid[nr][nc] = '0';
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}

const grid = [
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
];
console.log(numIslands(grid));    // 3
console.log(numIslandsBFS(grid)); // 3`,
        },
        {
          title: 'Course Schedule I and II — Kahn\'s topological sort',
          lang: 'javascript',
          code: `function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);   // edge: pre -> course
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);

  const order = [];
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    order.push(c);                              // take this course
    for (const next of graph[c]) {
      inDegree[next]--;                         // one prerequisite done
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return order.length === numCourses ? order : []; // [] means a cycle
}

const canFinish = (n, pre) => findOrder(n, pre).length === n;

console.log(canFinish(2, [[1, 0]]));                         // true
console.log(canFinish(2, [[1, 0], [0, 1]]));                 // false (cycle)
console.log(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]])); // [ 0, 1, 2, 3 ]`,
        },
      ],
      output: `**Islands dry run:** scanning row 0, cell (0,0) is land → islands = 1, sink the 2×2 block at the top-left. Next unvisited land is (2,2) → islands = 2, it has no land neighbours. Then (3,3) → islands = 3, sinking also removes (3,4). Answer **3**. Both versions agree.

**Course Schedule dry run with 4 courses:** in-degrees: 0→0, 1→1, 2→1, 3→2. Queue starts with \`[0]\`. Take 0 → courses 1 and 2 drop to 0 → queue them. Take 1 → course 3 drops to 1. Take 2 → course 3 drops to 0 → queue it. Take 3. Order **[0, 1, 2, 3]** (all 4 taken → possible).

With \`[[1,0],[0,1]]\`, both courses have in-degree 1, the queue starts empty, nothing is taken → cycle → **false**.

**Complexity:** Islands O(rows × cols) time, O(rows × cols) worst-case space (recursion or queue). Course Schedule O(V + E) time and space.`,
      questions: [
        { q: 'Number of Islands: how do you avoid counting the same island twice?', a: 'When you find new land, flood-fill the whole island and mark every cell visited (or sink it to water). Later scans skip those cells.' },
        { q: 'Is it OK to modify the grid?', a: 'It saves memory, but it changes the caller\'s data. Ask the interviewer; otherwise copy the grid or use a separate visited Set of "r,c" keys.' },
        { q: 'How does topological sort detect a cycle?', a: 'Nodes in a cycle never reach in-degree 0, so they never enter the queue. If the number of processed nodes is less than the total, a cycle exists.' },
        { q: 'How do you solve Course Schedule with DFS?', a: 'Use three states per node: unvisited, visiting, visited. DFS from each node; if you reach a node marked "visiting", you found a back edge (cycle). Mark nodes "visited" after exploring all their neighbours.' },
        { q: 'What is multi-source BFS?', a: 'Start BFS with many nodes in the queue at once, e.g. all rotten oranges in Rotting Oranges. Each BFS level is one minute, giving the time for all cells to be reached.' },
      ],
      spoken: `"For Number of Islands I treat the grid as a graph. I scan every cell, and when I find land that hasn't been visited, I count a new island and flood-fill it with DFS or BFS, marking every connected land cell so it's never counted again. That's O(rows times cols). For Course Schedule, the courses form a directed graph and the question is whether it has a cycle. I use Kahn's topological sort: compute in-degrees, start with courses that have no prerequisites, and each time I take a course I decrease its dependents' in-degrees. If I can take every course, there's no cycle."`,
      mistakes: [
        'Islands: counting diagonal neighbours when the problem only allows up, down, left and right.',
        'Islands: comparing with the number `1` when the grid holds strings `\'1\'` (or the other way round).',
        'Islands: recursive DFS on a huge grid causing a stack overflow — mention BFS as the safer alternative.',
        'Course Schedule: drawing the edge in the wrong direction (`course -> pre` instead of `pre -> course`), which reverses the order.',
        'Follow-up trap: "What is the time complexity if the grid is m × n?" O(m × n) — each cell is visited a constant number of times, even though it may look like nested loops plus DFS.',
      ],
      takeaway: 'Islands = count the flood fills on unvisited land; Course Schedule = topological sort — if not all nodes get processed, there\'s a cycle.',
    },
    {
      id: 'heaps',
      title: 'Heaps and Priority Queues (MinHeap in JavaScript)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A heap always gives you the smallest (or largest) item in O(1) and adds/removes in O(log n). JavaScript has none built in, so write a small MinHeap.',
      what: `A **priority queue** is a queue where the item with the **highest priority** comes out first, not the oldest one. A **heap** is the usual way to build it.

A **min-heap** is a binary tree where every parent is **smaller than or equal to** its children. So the smallest item is always at the top (the root). A **max-heap** is the opposite.

Operations:
- \`peek()\` — look at the smallest item: **O(1)**.
- \`push(x)\` — add an item: **O(log n)**.
- \`pop()\` — remove the smallest item: **O(log n)**.
- Build a heap from n items: O(n) with "heapify", or O(n log n) by pushing one by one.

**JavaScript has no built-in heap or priority queue** (unlike Python's \`heapq\` or Java's \`PriorityQueue\`). In an interview, say this and write a short MinHeap class, or ask if you may assume one exists.

#### Deeper version
A heap is stored in a plain **array** — no node objects. For the item at index \`i\`:
- parent is at \`Math.floor((i - 1) / 2)\`
- left child at \`2i + 1\`, right child at \`2i + 2\`

**Push:** add at the end, then **bubble up** — swap with the parent while it is smaller than the parent.
**Pop:** take the root, move the last item to the root, then **sink down** — swap with the smaller child while it's bigger than that child.

The tree is always **complete** (filled left to right), so its height is log n — that's where O(log n) comes from. A heap is **not** sorted: only the top is guaranteed; siblings have no order.

To get a max-heap, pass a comparator \`(a, b) => b - a\`, or push negated numbers into a min-heap. Store \`[priority, value]\` pairs to attach data.

Uses: Top K problems, Kth largest, Merge K Sorted Lists, Dijkstra's shortest path, median of a stream (two heaps), task schedulers, rate-limited job queues.`,
      why: `Whenever a problem says "K largest", "K closest", "always process the smallest/earliest next", or "merge K sorted things", a heap gives O(n log k) instead of sorting everything in O(n log n) — and it works on streams where you can't sort all the data at once.`,
      analogy: `A hospital emergency room. Patients don't get treated in arrival order — the most urgent patient is always seen next. When a new patient arrives, the nurse quickly places them by urgency (bubble up). When the doctor takes the top patient, the next most urgent person moves up (sink down).`,
      code: [
        {
          title: 'A minimal MinHeap with a custom comparator',
          lang: 'javascript',
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.data = [];
    this.compare = compare; // negative if a should be above b
  }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }

  push(value) {
    const d = this.data;
    d.push(value);
    let i = d.length - 1;
    while (i > 0) {                                     // bubble up
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(d[i], d[parent]) >= 0) break;
      [d[i], d[parent]] = [d[parent], d[i]];
      i = parent;
    }
  }

  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0];
    const last = d.pop();
    if (d.length > 0) {
      d[0] = last;
      let i = 0;
      while (true) {                                    // sink down
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < d.length && this.compare(d[l], d[smallest]) < 0) smallest = l;
        if (r < d.length && this.compare(d[r], d[smallest]) < 0) smallest = r;
        if (smallest === i) break;
        [d[i], d[smallest]] = [d[smallest], d[i]];
        i = smallest;
      }
    }
    return top;
  }
}

const heap = new MinHeap();
for (const x of [5, 3, 8, 1, 9, 2]) heap.push(x);
console.log(heap.peek());                         // 1
const out = [];
while (heap.size) out.push(heap.pop());
console.log(out);                                 // [ 1, 2, 3, 5, 8, 9 ]

// Max-heap of tasks by priority, using [priority, name] pairs
const tasks = new MinHeap((a, b) => b[0] - a[0]);
tasks.push([2, 'email']); tasks.push([5, 'outage']); tasks.push([1, 'lunch']);
console.log(tasks.pop()[1], tasks.pop()[1]);      // outage email`,
        },
      ],
      output: `After pushing 5, 3, 8, 1, 9, 2, the smallest value **1** sits at the root, so \`peek()\` returns 1. Popping repeatedly always removes the current smallest, so we get the values in sorted order \`[1, 2, 3, 5, 8, 9]\` (this is **heap sort**, O(n log n)).

**Dry run of push(1)** when the array is \`[3, 5, 8]\`: append → \`[3, 5, 8, 1]\` at index 3. Parent index 1 holds 5 > 1 → swap → \`[3, 1, 8, 5]\`. Parent index 0 holds 3 > 1 → swap → \`[1, 3, 8, 5]\`. Stop at the root.

The task heap uses a reversed comparator, so it acts as a **max-heap** on priority: \`outage\` (5) comes out first, then \`email\` (2).

**Complexity:** peek O(1), push O(log n), pop O(log n), space O(n).`,
      questions: [
        { q: 'Does JavaScript have a built-in priority queue?', a: 'No. You write a small binary heap class, use a library, or (in an interview) ask if you can assume a `MinPriorityQueue` like LeetCode provides. Sorting after every insert would be O(n log n) per insert.' },
        { q: 'How is a heap stored in an array?', a: 'Level by level. For index i, the parent is `Math.floor((i - 1) / 2)`, the children are `2i + 1` and `2i + 2`. No pointers are needed because the tree is complete.' },
        { q: 'Is a heap sorted?', a: 'No. Only the root is guaranteed to be the min (or max). Each parent is ≤ its children, but siblings and cousins have no order.' },
        { q: 'How do you make a max-heap from a min-heap?', a: 'Pass a reversed comparator `(a, b) => b - a`, or push negated values and negate them when you pop.' },
        { q: 'How do you find the median of a data stream?', a: 'Two heaps: a max-heap for the smaller half and a min-heap for the larger half, kept balanced in size. The median is the top of one heap or the average of both tops. O(log n) per insert, O(1) per median.' },
      ],
      spoken: `"A heap is a complete binary tree where every parent is smaller than its children in a min-heap, so the smallest item is always at the root. It's stored in an array, with children at 2i plus 1 and 2i plus 2. Peek is O(1), and push and pop are O(log n) because I bubble the new item up or sink the moved item down along one path of the tree. JavaScript has no built-in priority queue, so in interviews I write a small MinHeap class with a comparator. I use heaps for top-K problems, Kth largest, merging K sorted lists and Dijkstra."`,
      mistakes: [
        'Saying JavaScript has a built-in PriorityQueue — it does not.',
        'Sorting the array after every insert to fake a heap — that is O(n log n) per insert instead of O(log n).',
        'Wrong child index math: children are `2i + 1` and `2i + 2` with 0-based arrays.',
        'In `pop`, forgetting the single-element case: after `d.pop()` the array is empty, so you must not write `last` back into index 0.',
        'Follow-up trap: "What is the time to build a heap from n items?" O(n) with bottom-up heapify (sinking from the last parent to the root), even though n pushes would be O(n log n).',
      ],
      takeaway: 'Heap = always-ready min (or max): peek O(1), push/pop O(log n); JS has none built in, so know a 30-line MinHeap.',
    },
    {
      id: 'heap-problems',
      title: 'Heap Problems: Kth Largest Element, K Closest Points, Merge K Sorted Lists',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Keep a min-heap of size k: the top is the Kth largest. The same "heap of size k" idea gives K closest points and merges K sorted lists in O(n log k).',
      what: `**1. Kth Largest Element in an Array** — \`[3,2,1,5,6,4]\`, k=2 → 5.
- Simple: sort descending and take index k-1 → O(n log n).
- Better: keep a **min-heap of size k**. Push each number; if the heap grows past k, pop the smallest. At the end the heap holds the k largest, and its top is the **Kth largest**. O(n log k) time, O(k) space.
- Average-best: **Quickselect** (quick sort's partition, but only recurse into the side that contains the answer) → O(n) average, O(n²) worst.

**2. K Closest Points to Origin** — return the k points nearest to (0, 0). Use a **max-heap of size k** keyed by squared distance: if a closer point comes, pop the farthest. O(n log k).

**3. Merge K Sorted Lists / Arrays** — push the first element of each list into a min-heap. Pop the smallest, add it to the result, push the next element from the same list. O(N log k), where N is the total number of elements.

#### Deeper version
Why a **min**-heap for the k **largest**? The heap's job is to quickly find the **weakest** member of the current top-k club so it can be kicked out. The weakest of the k largest is the smallest one — so a min-heap. Mirror rule: k smallest / k closest → max-heap.

Use **squared** distance (\`x*x + y*y\`) for comparisons — \`Math.sqrt\` is slower and unnecessary because the order is the same.

When to say which: n huge and k small (or data streaming) → heap. One-off on an array that fits in memory → quickselect (O(n) average) is the "optimal" answer interviewers sometimes want, but mention its O(n²) worst case and that a random pivot avoids it in practice. Sorting is acceptable as a first answer.

**Kth Largest Element in a Stream** (design question): keep the size-k min-heap as the object's state; each \`add(val)\` is O(log k).`,
      why: `"Top K" and "Kth largest" questions are extremely common, and they show whether you know a heap beats a full sort when k is small. Merge K Sorted Lists is a classic hard-level question that is easy once you see the heap. These patterns also match real work: leaderboards, top trending items, and merging sorted results from many database shards.`,
      analogy: `Kth largest is like a "top 3 scores" board in an arcade. The board only has 3 slots. When a new score arrives, it's compared to the **lowest** score on the board; if it's higher, the lowest is removed and the new one goes up. At the end, the lowest score on the board is the 3rd highest overall.`,
      code: [
        {
          title: 'Kth Largest — size-k min-heap and quickselect',
          lang: 'javascript',
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) { this.d = []; this.cmp = compare; }
  get size() { return this.d.length; }
  peek() { return this.d[0]; }
  push(v) {
    const d = this.d; d.push(v);
    for (let i = d.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (this.cmp(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.d, top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < d.length && this.cmp(d[l], d[m]) < 0) m = l;
        if (r < d.length && this.cmp(d[r], d[m]) < 0) m = r;
        if (m === i) break;
        [d[i], d[m]] = [d[m], d[i]]; i = m;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop(); // drop the smallest -> keep the k largest
  }
  return heap.peek();              // smallest of the k largest
}

// Quickselect: O(n) average
function quickselect(nums, k) {
  const arr = [...nums];
  const target = arr.length - k;   // index of the answer in sorted order
  let lo = 0, hi = arr.length - 1;
  while (true) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [arr[r], arr[hi]] = [arr[hi], arr[r]];
    let i = lo;
    for (let j = lo; j < hi; j++) if (arr[j] < arr[hi]) { [arr[i], arr[j]] = [arr[j], arr[i]]; i++; }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];   // pivot now at its sorted index i
    if (i === target) return arr[i];
    if (i < target) lo = i + 1; else hi = i - 1;
  }
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4
console.log(quickselect([3, 2, 1, 5, 6, 4], 2));             // 5`,
        },
        {
          title: 'K Closest Points and Merge K Sorted Arrays',
          lang: 'javascript',
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) { this.d = []; this.cmp = compare; }
  get size() { return this.d.length; }
  push(v) {
    const d = this.d; d.push(v);
    for (let i = d.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (this.cmp(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.d, top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < d.length && this.cmp(d[l], d[m]) < 0) m = l;
        if (r < d.length && this.cmp(d[r], d[m]) < 0) m = r;
        if (m === i) break;
        [d[i], d[m]] = [d[m], d[i]]; i = m;
      }
    }
    return top;
  }
}

function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;                  // squared distance
  const maxHeap = new MinHeap((a, b) => dist(b) - dist(a)); // farthest on top
  for (const p of points) {
    maxHeap.push(p);
    if (maxHeap.size > k) maxHeap.pop();                    // drop the farthest
  }
  return maxHeap.d;
}
console.log(JSON.stringify(kClosest([[1, 3], [-2, 2], [5, 8], [0, 1]], 2))); // [[-2,2],[0,1]]

function mergeKSorted(lists) {
  const heap = new MinHeap((a, b) => a[0] - b[0]); // [value, listIndex, elemIndex]
  lists.forEach((list, i) => { if (list.length) heap.push([list[0], i, 0]); });
  const result = [];
  while (heap.size) {
    const [val, li, ei] = heap.pop();
    result.push(val);
    if (ei + 1 < lists[li].length) heap.push([lists[li][ei + 1], li, ei + 1]);
  }
  return result;
}
console.log(mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]])); // [ 1, 1, 2, 3, 4, 4, 5, 6 ]`,
        },
      ],
      output: `**Dry run — findKthLargest([3,2,1,5,6,4], k=2):**
- push 3 → {3}. push 2 → {2,3}. push 1 → size 3 > 2 → pop 1 → {2,3}.
- push 5 → pop 2 → {3,5}. push 6 → pop 3 → {5,6}. push 4 → pop 4 → {5,6}.
- Top of the heap = **5**, the 2nd largest.

Quickselect gets the same answer by partitioning until the pivot lands at index \`n - k\` = 4 in sorted order.

**K Closest:** squared distances are 10, 8, 89 and 1. The max-heap of size 2 throws out the farthest each time, leaving \`[-2,2]\` (8) and \`[0,1]\` (1). The heap's internal order is not sorted — the problem allows any order.

**Merge K:** the heap always holds one candidate from each list, so the smallest remaining value overall is always on top: \`[1, 1, 2, 3, 4, 4, 5, 6]\`.

**Complexity:** Kth Largest O(n log k) time, O(k) space (quickselect O(n) average). K Closest O(n log k). Merge K O(N log k) time, O(k) heap space.`,
      questions: [
        { q: 'Why use a min-heap to find the Kth largest?', a: 'The heap stores the k largest seen so far. To decide if a new number belongs, you compare with the smallest of them — the min-heap top. After all numbers, that top is exactly the Kth largest.' },
        { q: 'Heap vs sort vs quickselect for Kth largest?', a: 'Sort: O(n log n), simplest. Heap: O(n log k), good for streams and small k. Quickselect: O(n) average but O(n²) worst case, and it rearranges the array.' },
        { q: 'Why use squared distance in K Closest Points?', a: 'Square root keeps the same order, so comparing x² + y² gives the same ranking and avoids slower, floating-point `Math.sqrt` calls.' },
        { q: 'What is the complexity of Merge K Sorted Lists with a heap?', a: 'O(N log k): each of the N elements is pushed and popped once, and the heap never holds more than k items.' },
      ],
      spoken: `"For Kth Largest, I keep a min-heap of size k. I push every number, and whenever the heap grows past k, I pop the smallest. At the end the heap holds the k largest numbers, and its top is the Kth largest. That's O(n log k) time and O(k) space, which beats sorting when k is small, and it also works on a stream. If they want average linear time, I mention quickselect. The same size-k heap idea solves K Closest Points with a max-heap on squared distance, and Merge K Sorted Lists by always popping the smallest head."`,
      mistakes: [
        'Using a max-heap of all n elements and popping k times — it works but is O(n + k log n) with O(n) space, and misses the size-k idea.',
        'For "k largest" using a max-heap of size k (or for "k closest" a min-heap of size k) — the heap must expose the element you would throw away.',
        'Quickselect: forgetting that `k`-th largest is index `n - k` in ascending order.',
        'Merge K: pushing whole lists or forgetting to push the next element from the same list after popping.',
        'Follow-up trap: "Top K in a huge file that doesn\'t fit in memory?" Stream through it with a size-k heap (O(k) memory), or split into chunks, compute top k per chunk, and merge the partial results.',
      ],
      takeaway: 'K largest → min-heap of size k (top = Kth largest); K smallest/closest → max-heap of size k; merge K lists → min-heap of heads.',
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming Basics (Memoization vs Tabulation)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'DP = solve each small subproblem once and reuse the answer. Top-down memoization caches a recursion; bottom-up tabulation fills a table with a loop.',
      what: `**Dynamic programming (DP)** is a way to solve a problem by breaking it into smaller **overlapping subproblems**, solving each one **once**, and saving the answer so you never compute it again.

A problem fits DP when:
1. **Overlapping subproblems** — the same smaller question is asked again and again (like \`fib(3)\` inside \`fib(5)\` many times).
2. **Optimal substructure** — the best answer can be built from best answers to smaller pieces.

Two ways to write it:
- **Memoization (top-down)** — write the natural recursion, then add a cache (Map or array). Before computing, check the cache.
- **Tabulation (bottom-up)** — make a table \`dp\`, fill the smallest cases first with a loop, and build up to the answer. No recursion.

#### Deeper version
A recipe that works for most DP problems:
1. **State** — what does \`dp[i]\` (or \`dp[i][j]\`) mean, in words? E.g. "the number of ways to reach step i".
2. **Transition** — how is \`dp[i]\` built from smaller states? E.g. \`dp[i] = dp[i-1] + dp[i-2]\`.
3. **Base cases** — the smallest states you know directly.
4. **Order** — fill states so every dependency is ready (usually small to large).
5. **Answer** — which state holds the final answer.
6. **Space optimization** — if \`dp[i]\` only needs the last one or two values, keep just those variables → O(1) space.

Memoization vs tabulation: memoization is easier to write from a recursion and only computes states you actually need, but has recursion overhead and can overflow the stack for large n. Tabulation has no recursion limit, is often faster, and makes space optimization easy, but you must work out the fill order.

Complexity of DP = **(number of states) × (work per state)**. Fibonacci: n states × O(1) = O(n). Coin Change: amount × coins.

Common DP families: 1D (Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence), 2D grids (Unique Paths, Min Path Sum), two strings (Longest Common Subsequence, Edit Distance), knapsack (subset sum, target sum), and intervals.`,
      why: `DP problems are considered the hardest common interview category, and many candidates freeze on them. A fixed recipe (state, transition, base case) turns them into a routine. DP also appears in real work: diff tools (LCS), spell checkers (edit distance), route planning and pricing optimization.`,
      analogy: `If someone asks you "what is 1+1+1+1+1+1+1+1?", you count: 8. If they add "+1" and ask again, you don't recount — you remember 8 and say 9. That memory of a previous answer is dynamic programming. Memoization is writing answers on sticky notes as you happen to need them; tabulation is filling a times-table chart from the top-left corner in order.`,
      code: [
        {
          title: 'Same problem three ways: recursion, memoization, tabulation',
          lang: 'javascript',
          code: `// Number of ways to climb n stairs taking 1 or 2 steps (the Fibonacci pattern)

// 1. Plain recursion: O(2^n) — recomputes the same states
function waysSlow(n) {
  if (n <= 1) return 1;
  return waysSlow(n - 1) + waysSlow(n - 2);
}

// 2. Memoization (top-down): O(n) time, O(n) space
function waysMemo(n, memo = new Map()) {
  if (n <= 1) return 1;
  if (memo.has(n)) return memo.get(n);
  const result = waysMemo(n - 1, memo) + waysMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// 3. Tabulation (bottom-up): O(n) time, O(n) space
function waysTable(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1; dp[1] = 1;                       // base cases
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

// 4. Space-optimized: only the last two values are needed -> O(1) space
function ways(n) {
  let prev2 = 1, prev1 = 1;                   // dp[0], dp[1]
  for (let i = 2; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}

console.log(waysSlow(10), waysMemo(10), waysTable(10), ways(10)); // 89 89 89 89
console.log(waysMemo(50));   // 20365011074
console.log(ways(80));       // 37889062373143900 (wrong! past MAX_SAFE_INTEGER)

// Exact big answers: same loop with BigInt
function waysBig(n) {
  let prev2 = 1n, prev1 = 1n;
  for (let i = 2; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}
console.log(waysBig(80));    // 37889062373143906n`,
        },
      ],
      output: `All four versions return **89** for 10 stairs. The difference is speed: \`waysSlow(80)\` would need trillions of calls, while the memoized, table and optimized versions each compute 80 states once.

**Table for n = 5:** \`dp = [1, 1, 2, 3, 5, 8]\`. Each cell is the sum of the two before it, because to reach step i your last move was either 1 step (from i-1) or 2 steps (from i-2).

Note the JavaScript trap in the last lines: the real answer for 80 stairs is 37889062373143906, which is larger than \`Number.MAX_SAFE_INTEGER\` (about 9 × 10^15). Normal numbers silently lose precision and print \`37889062373143900\`. The \`BigInt\` version (\`1n\`) gives the exact value. Interview problems usually keep answers small or ask for the result modulo 10^9 + 7.

**Complexity:** recursion O(2^n); memoization and tabulation O(n) time, O(n) space; the optimized loop O(n) time, O(1) space.`,
      questions: [
        { q: 'What is dynamic programming?', a: 'A technique for problems with overlapping subproblems and optimal substructure: solve each subproblem once, store the result, and build bigger answers from smaller ones.' },
        { q: 'Memoization vs tabulation?', a: 'Memoization is top-down: recursion plus a cache, computes only needed states, but uses the call stack. Tabulation is bottom-up: a loop fills a table from base cases, no recursion limit, and easier to optimize for space.' },
        { q: 'DP vs divide and conquer?', a: 'Both split problems. Divide and conquer (merge sort) has independent subproblems that never repeat. DP is for overlapping subproblems that repeat, so caching pays off.' },
        { q: 'DP vs greedy?', a: 'Greedy makes the best local choice and never looks back; it is only correct for some problems (like interval scheduling). DP considers all choices for each state, so it is correct more often but usually slower.' },
        { q: 'How do you find the time complexity of a DP solution?', a: 'Number of states × work per state. For example, Coin Change has `amount` states and tries every coin per state: O(amount × coins).' },
      ],
      spoken: `"Dynamic programming is for problems where the same subproblems repeat and the best answer can be built from best sub-answers. I start by defining the state in words — for example, dp of i is the number of ways to reach step i — then the transition, like dp of i equals dp of i minus one plus dp of i minus two, then the base cases. I write it top-down with recursion and a memo cache, or bottom-up with a table. If each state only needs the last few, I keep just those for O(1) space. The complexity is the number of states times the work per state."`,
      mistakes: [
        'Jumping into code without defining what `dp[i]` means — most DP bugs come from a fuzzy state definition.',
        'Wrong or missing base cases (e.g. `dp[0]`), which shifts every answer.',
        'Filling the table in the wrong order, so a state reads a value that is not computed yet.',
        'Memoization with a cache that is not shared between recursive calls (creating a new Map in each call).',
        'Follow-up trap: "Can you reduce the space?" If `dp[i]` depends only on `dp[i-1]` and `dp[i-2]`, keep two variables. For 2D tables that only use the previous row, keep one or two rows.',
      ],
      takeaway: 'DP = define the state, write the transition, set the base cases, then memoize (top-down) or tabulate (bottom-up).',
    },
    {
      id: 'dp-problems-1d',
      title: 'DP Problems: Climbing Stairs, House Robber, Min Cost Climbing Stairs',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Climbing Stairs: ways(i) = ways(i-1) + ways(i-2). House Robber: best(i) = max(skip this house, rob it + best(i-2)).',
      what: `**1. Climbing Stairs** — you climb n steps, taking 1 or 2 steps at a time. How many different ways? n=3 → 3 (1+1+1, 1+2, 2+1).
- Brute force: recursion trying both moves → O(2^n).
- DP state: \`dp[i]\` = number of ways to reach step i. Transition: the last move was a 1-step from i-1 or a 2-step from i-2, so \`dp[i] = dp[i-1] + dp[i-2]\`. Base: \`dp[0] = 1\`, \`dp[1] = 1\`. O(n) time, O(1) space with two variables.

**2. House Robber** — houses in a row with money \`nums[i]\`. You can't rob two **adjacent** houses. Max money? \`[2,7,9,3,1]\` → 12 (2 + 9 + 1).
- Brute force: try every valid subset → O(2^n).
- DP state: \`dp[i]\` = most money from the first i houses. Choice at house i: **skip it** (\`dp[i-1]\`) or **rob it** (\`nums[i] + dp[i-2]\`). Take the max. O(n) time, O(1) space.

**3. Min Cost Climbing Stairs** (bonus) — \`cost[i]\` is paid when you step on stair i; you may start at stair 0 or 1 and move 1 or 2 steps. Min cost to reach the top: \`dp[i] = cost[i] + min(dp[i-1], dp[i-2])\`.

#### Deeper version
Why greedy fails for House Robber: "always take the biggest house" or "take every other house" both fail. For \`[2, 1, 1, 2]\` the best is 2 + 2 = 4 (houses 0 and 3), which is neither the even-index nor the odd-index set (both give 3). Only trying both choices at every house (DP) is always right.

**House Robber II** — houses are in a **circle**, so the first and last are neighbours. Run the linear version twice: once without the last house, once without the first, and take the max.

Climbing Stairs with steps \`{1, 3, 5}\` or any step set generalises to \`dp[i] = sum of dp[i - s] for each step s\` — the same shape as Coin Change (ways version).`,
      why: `Climbing Stairs is the most common "first DP question" and House Robber is the classic "take it or skip it" choice DP. If you can explain these two clearly, with the state, transition and why greedy fails, you are ready for most medium DP questions.`,
      analogy: `House Robber is like choosing which days to work extra shifts when you can't work two days in a row. For each day you ask: "Is it better to rest today and keep yesterday's total, or work today and add today's pay to my total from two days ago?"`,
      code: [
        {
          title: 'Climbing Stairs and House Robber — O(1) space',
          lang: 'javascript',
          code: `function climbStairs(n) {
  let prev2 = 1, prev1 = 1;        // ways to reach step 0 and step 1
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;    // came from i-1 or i-2
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
console.log(climbStairs(2), climbStairs(3), climbStairs(5)); // 2 3 8

function rob(nums) {
  let prev2 = 0, prev1 = 0;        // best up to house i-2 and i-1
  for (const money of nums) {
    const curr = Math.max(prev1, prev2 + money); // skip it OR rob it
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
console.log(rob([1, 2, 3, 1]));    // 4  (1 + 3)
console.log(rob([2, 7, 9, 3, 1])); // 12 (2 + 9 + 1)
console.log(rob([2, 1, 1, 2]));    // 4  (2 + 2, not every other house)

// House Robber II: houses in a circle
function robCircle(nums) {
  if (nums.length === 1) return nums[0];
  return Math.max(rob(nums.slice(0, -1)), rob(nums.slice(1)));
}
console.log(robCircle([2, 3, 2])); // 3`,
        },
        {
          title: 'Min Cost Climbing Stairs (tabulation)',
          lang: 'javascript',
          code: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  const dp = new Array(n);
  dp[0] = cost[0];
  dp[1] = cost[1];
  for (let i = 2; i < n; i++) {
    dp[i] = cost[i] + Math.min(dp[i - 1], dp[i - 2]); // pay for stair i
  }
  return Math.min(dp[n - 1], dp[n - 2]); // the top is one step past the end
}

console.log(minCostClimbingStairs([10, 15, 20]));                           // 15
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])); // 6`,
        },
      ],
      output: `**Dry run — climbStairs(5):** ways for steps 0..5 are 1, 1, 2, 3, 5, **8** (each is the sum of the two before).

**Dry run — rob([2, 7, 9, 3, 1]):**
- house 2: max(0, 0 + 2) = 2
- house 7: max(2, 0 + 7) = 7
- house 9: max(7, 2 + 9) = 11
- house 3: max(11, 7 + 3) = 11
- house 1: max(11, 11 + 1) = **12**

\`[2, 1, 1, 2]\` gives 4 by robbing the first and last houses — a pattern no simple "every other house" rule finds. In a circle, \`[2, 3, 2]\` can't use both 2s (they are neighbours), so the best is **3**.

**Min Cost:** for \`[10, 15, 20]\` the cheapest is to start on stair 1 (15) and jump two steps to the top: **15**.

**Complexity:** all are O(n) time; Climbing Stairs and House Robber use O(1) space, the table version O(n).`,
      questions: [
        { q: 'Why is Climbing Stairs the Fibonacci sequence?', a: 'To reach step i, your last move came from step i-1 (one step) or i-2 (two steps). So ways(i) = ways(i-1) + ways(i-2), which is the Fibonacci recurrence.' },
        { q: 'What is the state and transition for House Robber?', a: '`dp[i]` = max money from the first i houses. `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`: either skip house i or rob it and add the best from two houses back.' },
        { q: 'Why doesn\'t robbing every other house work?', a: 'Sometimes the best plan skips two houses in a row, like `[2, 1, 1, 2]` where robbing houses 0 and 3 gives 4. DP tries both choices at each house, so it finds this.' },
        { q: 'How do you solve House Robber II (circular street)?', a: 'The first and last houses can\'t both be robbed. Run the linear solution on `nums[0..n-2]` and on `nums[1..n-1]` and return the larger result. Handle a single house separately.' },
      ],
      spoken: `"Climbing Stairs is the classic first DP problem. The number of ways to reach step i is the ways to reach i minus one plus the ways to reach i minus two, since the last move was one or two steps. That's the Fibonacci recurrence, and I only keep two variables, so it's O(n) time and O(1) space. House Robber is a take-or-skip DP: at each house, the best total is the max of skipping it, which keeps the previous best, or robbing it, which adds its money to the best from two houses back. Greedy rules like every other house fail, but this DP always works."`,
      mistakes: [
        'Climbing Stairs: writing plain recursion without memoization — O(2^n) and times out around n = 45.',
        'House Robber: using "sum of even indexes vs sum of odd indexes", which fails on `[2, 1, 1, 2]`.',
        'House Robber: updating `prev2` and `prev1` in the wrong order and losing the old value — compute `curr` first.',
        'Off-by-one on the "top" in Min Cost Climbing Stairs: the top is one step past the last stair.',
        'Follow-up trap: "Return which houses were robbed?" Keep the full `dp` array, then walk backwards: if `dp[i] !== dp[i-1]`, house i was robbed, so jump to i-2; else move to i-1.',
      ],
      takeaway: 'Ways = add the ways from the previous states; best = max over "take it" and "skip it" — then keep only the last two values.',
    },
    {
      id: 'dp-problems-coin-change-lis',
      title: 'DP Problems: Coin Change, Coin Change II, Longest Increasing Subsequence',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Coin Change: dp[a] = 1 + min(dp[a - coin]). Coin Change II counts combinations with coins in the outer loop. LIS: dp[i] = 1 + max(dp[j]) for smaller earlier values.',
      what: `**1. Coin Change** — given coin values and an \`amount\`, return the **fewest coins** that make the amount, or -1. \`coins = [1, 2, 5]\`, amount 11 → 3 (5 + 5 + 1).
- Greedy (always take the biggest coin) **fails**: coins \`[1, 3, 4]\`, amount 6 → greedy gives 4+1+1 (3 coins), but 3+3 is 2 coins.
- DP state: \`dp[a]\` = fewest coins to make amount a. Transition: try every coin as the **last** coin: \`dp[a] = 1 + min(dp[a - coin])\`. Base: \`dp[0] = 0\`. Unreachable amounts stay \`Infinity\`. O(amount × coins) time, O(amount) space.

**2. Coin Change II** — count the **number of combinations** that make the amount. \`amount = 5, coins = [1, 2, 5]\` → 4.
- \`dp[a]\` = number of ways to make a. Loop **coins on the outside**, amounts inside: \`dp[a] += dp[a - coin]\`. This counts each combination once (1+2+2 and 2+1+2 are the same).

**3. Longest Increasing Subsequence (LIS)** — the length of the longest strictly increasing subsequence (not necessarily contiguous). \`[10,9,2,5,3,7,101,18]\` → 4 (\`2,3,7,101\`).
- DP: \`dp[i]\` = LIS ending at index i = \`1 + max(dp[j])\` for every \`j < i\` with \`nums[j] < nums[i]\`. O(n²).
- Optimal: **patience sorting** with binary search — keep \`tails[k]\` = smallest possible tail of an increasing subsequence of length k+1. O(n log n).

#### Deeper version
Loop order in Coin Change II matters: with **amounts outside and coins inside**, you count **permutations** (orderings), because 1+2 and 2+1 are counted separately — that's a different problem (Combination Sum IV). With coins outside, each coin is "introduced" once, so every combination is counted in one fixed coin order.

Coin Change is an **unbounded knapsack**: each coin can be used many times, so \`dp[a]\` reads from the same row. In **0/1 knapsack** (each item once), loop the amount **downwards** so you don't reuse the item.

The \`tails\` array in O(n log n) LIS is not itself a valid subsequence — only its **length** is the answer. Mention this; it's a common follow-up.`,
      why: `Coin Change is the most famous "greedy fails, DP works" question and the gateway to knapsack problems. LIS shows a DP over pairs (O(n²)) and a clever O(n log n) upgrade with binary search. These are standard medium questions at product companies.`,
      analogy: `Coin Change is like a cashier who builds a cheat sheet: "fewest coins for ₹1, ₹2, ₹3, ..." For each new amount, she asks: "If my last coin is ₹5, how many coins did I need for amount − 5? Add one." She tries every coin and writes down the best. When the customer asks for ₹11, the answer is already on the sheet.`,
      code: [
        {
          title: 'Coin Change (min coins) and Coin Change II (count combinations)',
          lang: 'javascript',
          code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                   // 0 coins make amount 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)
console.log(coinChange([2], 3));        // -1
console.log(coinChange([1, 3, 4], 6));  // 2 (3 + 3; greedy would say 3)
console.log(coinChange([1], 0));        // 0

function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;                                   // one way to make 0: use nothing
  for (const coin of coins) {                  // coins OUTSIDE -> combinations
    for (let a = coin; a <= amount; a++) dp[a] += dp[a - coin];
  }
  return dp[amount];
}

console.log(change(5, [1, 2, 5])); // 4
console.log(change(3, [2]));       // 0`,
        },
        {
          title: 'Longest Increasing Subsequence — O(n^2) DP and O(n log n)',
          lang: 'javascript',
          code: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);   // each number alone has length 1
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return nums.length ? Math.max(...dp) : 0;
}

function lengthOfLISFast(nums) {
  const tails = [];                            // tails[k] = smallest tail of length k+1
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {                          // first tail >= x (lower bound)
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    tails[lo] = x;                             // replace, or append if lo === length
  }
  return tails.length;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]));     // 4
console.log(lengthOfLISFast([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLISFast([0, 1, 0, 3, 2, 3]));           // 4
console.log(lengthOfLISFast([7, 7, 7, 7]));                 // 1`,
        },
      ],
      output: `**Dry run — coinChange([1, 2, 5], 11)** (first few cells):
- dp[0]=0, dp[1]=1 (1), dp[2]=1 (2), dp[3]=2 (2+1), dp[4]=2 (2+2), dp[5]=1 (5), dp[6]=2 (5+1), dp[7]=2 (5+2) ... dp[10]=2 (5+5), dp[11]=**3** (5+5+1).
- For \`[2]\` and amount 3, dp[3] stays Infinity → **-1**.

**Coin Change II for amount 5:** after coin 1: every amount has 1 way. After coin 2: dp = \`[1,1,2,2,3,3]\`. After coin 5: dp[5] = 3 + dp[0] = **4** (5, 2+2+1, 2+1+1+1, 1+1+1+1+1).

**LIS fast version on \`[10,9,2,5,3,7,101,18]\`:** tails: [10] → [9] → [2] → [2,5] → [2,3] → [2,3,7] → [2,3,7,101] → [2,3,7,18]. Length **4**. For \`[7,7,7,7]\` the answer is 1 because the sequence must be **strictly** increasing.

**Complexity:** Coin Change O(amount × coins) time, O(amount) space. Coin Change II same. LIS O(n²) or O(n log n) time, O(n) space.`,
      questions: [
        { q: 'Why does greedy fail for Coin Change?', a: 'Taking the largest coin first is only optimal for special coin systems (like real currencies). With coins `[1, 3, 4]` and amount 6, greedy picks 4+1+1 (3 coins) but 3+3 needs only 2. DP tries every last coin.' },
        { q: 'What is the state and transition for Coin Change?', a: '`dp[a]` = fewest coins for amount a. `dp[a] = 1 + min(dp[a - coin])` over all coins ≤ a, with `dp[0] = 0` and unreachable amounts at Infinity.' },
        { q: 'In Coin Change II, why are coins the outer loop?', a: 'So each combination is counted once, in a fixed coin order. With amounts outside, different orders like 1+2 and 2+1 are counted separately, which counts permutations instead.' },
        { q: 'How does the O(n log n) LIS work?', a: 'Keep `tails`, where `tails[k]` is the smallest ending value of any increasing subsequence of length k+1. For each number, binary search the first tail ≥ it and replace it (or append). The length of `tails` is the LIS length.' },
      ],
      spoken: `"Coin Change is a classic case where greedy fails, so I use bottom-up DP. dp of a is the fewest coins to make amount a. dp of zero is zero, and for each amount I try every coin as the last coin: one plus dp of a minus that coin, taking the minimum. Amounts I can't reach stay at infinity and I return minus one. That's O(amount times number of coins). For counting combinations I put the coins in the outer loop so each combination is counted once. For Longest Increasing Subsequence I can do an O(n²) DP, or O(n log n) with a tails array and binary search."`,
      mistakes: [
        'Coin Change: initializing `dp` with 0 instead of Infinity, so `Math.min` always picks 0.',
        'Coin Change: returning `dp[amount]` without converting Infinity to -1.',
        'Coin Change II: swapping the loop order and counting permutations (gives 9 instead of 4 for amount 5).',
        'LIS: confusing subsequence (any order-preserving pick) with subarray (contiguous).',
        'Follow-up trap: "Is the tails array the actual LIS?" No — only its length is correct. To rebuild the sequence, store a parent index for each element (in the O(n²) DP or alongside tails).',
      ],
      takeaway: 'Coin Change: dp[a] = 1 + min(dp[a − coin]) because greedy fails; count combinations with coins in the outer loop; LIS = O(n²) DP or O(n log n) tails.',
    },
    {
      id: 'dp-2d',
      title: '2D DP: Unique Paths and Longest Common Subsequence',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Grid DP: paths(r, c) = paths from above + paths from the left. Two-string DP: LCS[i][j] = match ? 1 + diagonal : max(up, left).',
      what: `When the state needs **two** numbers, the DP table becomes a 2D grid.

**1. Unique Paths** — a robot in an m × n grid starts top-left and can only move **right** or **down**. How many paths to the bottom-right? m=3, n=7 → 28.
- State: \`dp[r][c]\` = number of paths to cell (r, c). You can only arrive from above or from the left: \`dp[r][c] = dp[r-1][c] + dp[r][c-1]\`. First row and first column are all 1. O(m × n) time.
- Space trick: keep one row, \`row[c] += row[c - 1]\` → O(n) space.

**2. Longest Common Subsequence (LCS)** — the length of the longest sequence of characters that appears in both strings in the same order (not necessarily contiguous). \`"abcde"\` and \`"ace"\` → 3.
- State: \`dp[i][j]\` = LCS of the first i characters of \`a\` and first j of \`b\`.
- If \`a[i-1] === b[j-1]\`: \`dp[i][j] = 1 + dp[i-1][j-1]\` (use the match).
- Otherwise: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\` (drop one character from either string).
- O(m × n) time and space.

#### Deeper version
Two-string DPs all share this table with an extra row and column for the empty prefix:
- **Edit Distance** (Levenshtein): min inserts/deletes/replaces to turn a into b. If chars match, take the diagonal; else \`1 + min(insert, delete, replace)\`. Used in spell checkers and fuzzy search.
- **Longest Common Substring** (contiguous): on a match \`1 + diagonal\`, otherwise **0**.
- \`git diff\` and other diff tools are built on LCS-style algorithms.

Grid DP variants: **Minimum Path Sum** (\`grid[r][c] + min(up, left)\`), Unique Paths II (obstacles → that cell is 0). Unique Paths also has a math answer: choose which (m-1) of the (m+n-2) moves are "down" → C(m+n-2, m-1).`,
      why: `2D DP is the next step after 1D DP and appears in medium/hard rounds. Grid paths are the friendliest introduction, and LCS/Edit Distance are classic string questions with real uses in diffs, DNA comparison and search suggestions.`,
      analogy: `Unique Paths is like counting routes through a city where you can only walk east or south. The number of ways to reach any corner equals the ways to reach the corner just north plus the corner just west. You fill the city map block by block from the top-left.`,
      code: [
        {
          title: 'Unique Paths — full table and one-row version',
          lang: 'javascript',
          code: `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1)); // first row/col = 1
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; // from above + from the left
    }
  }
  return dp[m - 1][n - 1];
}

function uniquePathsRow(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1]; // row[c] was "above"
  }
  return row[n - 1];
}

console.log(uniquePaths(3, 7));    // 28
console.log(uniquePathsRow(3, 2)); // 3
console.log(uniquePathsRow(1, 1)); // 1`,
        },
        {
          title: 'Longest Common Subsequence and Edit Distance',
          lang: 'javascript',
          code: `function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];  // match
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);       // skip one
    }
  }
  return dp[m][n];
}

console.log(longestCommonSubsequence('abcde', 'ace')); // 3 ("ace")
console.log(longestCommonSubsequence('abc', 'def'));   // 0

function minDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

console.log(minDistance('horse', 'ros')); // 3`,
        },
      ],
      output: `**Unique Paths 3 × 7:** the table fills row by row. Row 0 is all 1s. Row 1 is 1, 2, 3, 4, 5, 6, 7. Row 2 is 1, 3, 6, 10, 15, 21, **28**. In the one-row version, before the update \`row[c]\` still holds the value from the row above, and \`row[c - 1]\` is the new value to the left — so \`+=\` adds "above + left".

**LCS("abcde", "ace"):** matches happen at a/a, c/c and e/e, each adding 1 to the diagonal. Mismatches carry forward the best of up/left. Final cell = **3**. For "abc" vs "def" nothing matches → 0.

**Edit distance "horse" → "ros":** replace h→r (rorse), delete r (rose), delete e (ros) = **3** operations.

**Complexity:** Unique Paths O(m × n) time, O(n) space with one row. LCS and Edit Distance O(m × n) time and space (can be reduced to two rows).`,
      questions: [
        { q: 'What is the recurrence for Unique Paths?', a: '`dp[r][c] = dp[r-1][c] + dp[r][c-1]`, because you can only arrive from above or from the left. The first row and first column have exactly one path.' },
        { q: 'Subsequence vs substring in LCS problems?', a: 'A subsequence keeps order but can skip characters ("ace" in "abcde"). A substring must be contiguous. For longest common substring, a mismatch resets the cell to 0 instead of taking max(up, left).' },
        { q: 'How do you reduce LCS space?', a: 'Each row only needs the previous row, so keep two 1D arrays (or one array plus a variable for the diagonal). Space becomes O(min(m, n)).' },
        { q: 'Where is LCS or edit distance used in real life?', a: 'Diff tools like `git diff`, spell checkers and "did you mean" suggestions, fuzzy search, and comparing DNA sequences.' },
      ],
      spoken: `"When the state needs two indexes, I use a 2D table. For Unique Paths, the number of ways to reach a cell is the ways to reach the cell above plus the cell to the left, with the first row and column set to one. I can keep just one row, so it's O(m times n) time and O(n) space. For Longest Common Subsequence, dp of i, j is the LCS of the two prefixes. If the current characters match, it's one plus the diagonal; otherwise it's the max of dropping a character from either string. Edit distance uses the same table with a min over insert, delete and replace."`,
      mistakes: [
        'Forgetting the extra row and column for empty prefixes in string DP, leading to index −1 bugs.',
        'Using `new Array(m).fill(new Array(n).fill(0))` — every row is the **same** array object, so writing one row changes all rows. Use `Array.from`.',
        'In LCS, taking `1 + max(up, left)` on a match instead of `1 + diagonal`.',
        'Follow-up trap: "Unique Paths with obstacles?" Set `dp` to 0 for obstacle cells (including the start if it\'s blocked), and the first row/column are 1 only until the first obstacle.',
      ],
      takeaway: 'Two indexes → 2D table: grid = up + left, two strings = match ? 1 + diagonal : max(up, left).',
    },
    {
      id: 'backtracking',
      title: 'Backtracking: Subsets, Permutations, Combination Sum',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Build a solution step by step, recurse, then undo the last choice (backtrack) to try the next one — the template for "generate all combinations".',
      what: `**Backtracking** is a way to explore **all possible choices**. You build an answer one step at a time. At each step you **choose** an option, **explore** further (recursion), then **un-choose** it (undo) and try the next option.

The template:
1. If the current path is a complete answer → save a **copy** of it.
2. For each available choice: push it to the path → recurse → pop it (backtrack).

**1. Subsets** — all subsets of \`[1,2,3]\` (8 of them, including \`[]\`). At each recursion level, save the current path, then try adding each later number. O(n · 2^n).

**2. Permutations** — all orderings of \`[1,2,3]\` (6 of them). Try every unused number at each position; track used numbers with a Set or boolean array. O(n · n!).

**3. Combination Sum** — all combinations of \`candidates\` (each usable many times) that add to \`target\`. \`[2,3,6,7]\`, target 7 → \`[[2,2,3],[7]]\`. Recurse with the remaining target; start each loop from the current index so combinations aren't repeated in another order; stop when the remaining target goes below 0.

#### Deeper version
Backtracking is DFS over a "decision tree". Its cost is usually exponential because the **number of answers** is exponential — you can't beat the output size. Speed comes from **pruning**: stop exploring a branch as soon as it can't lead to a valid answer (e.g. sort candidates and \`break\` when a candidate is bigger than the remaining target).

Handling **duplicates** in the input (Subsets II, Permutations II): sort first, then skip a number if it equals the previous one **at the same recursion level** (\`i > start && nums[i] === nums[i - 1]\`).

Other classic backtracking problems: N-Queens, Sudoku Solver, Word Search in a grid, Generate Parentheses, Letter Combinations of a Phone Number, Palindrome Partitioning.

Always push \`[...path]\` (a copy). Pushing \`path\` itself stores a reference to one array that keeps changing — you'd end up with a list of empty arrays.`,
      why: `"Generate all X" questions are common at mid-level and above. Backtracking gives one template for all of them, and interviewers check that you can explain the choose/explore/un-choose steps, avoid duplicates, prune, and state the exponential complexity honestly.`,
      analogy: `Trying outfits: pick a shirt, then try every pair of pants with it; for each pants, try every pair of shoes. After trying a pair of shoes, you take them off (backtrack) and try the next. When you've tried everything with this shirt, you take it off and pick the next shirt.`,
      code: [
        {
          title: 'Subsets and Permutations',
          lang: 'javascript',
          code: `function subsets(nums) {
  const result = [], path = [];
  function backtrack(start) {
    result.push([...path]);                  // every path is a valid subset (copy!)
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);                    // choose
      backtrack(i + 1);                      // explore
      path.pop();                            // un-choose
    }
  }
  backtrack(0);
  return result;
}
console.log(JSON.stringify(subsets([1, 2, 3])));
// [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]

function permute(nums) {
  const result = [], path = [], used = new Array(nums.length).fill(false);
  function backtrack() {
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);    // choose
      backtrack();                           // explore
      path.pop(); used[i] = false;           // un-choose
    }
  }
  backtrack();
  return result;
}
console.log(JSON.stringify(permute([1, 2, 3])));
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`,
        },
        {
          title: 'Combination Sum with pruning',
          lang: 'javascript',
          code: `function combinationSum(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b); // sort so we can prune
  const result = [], path = [];
  function backtrack(start, remaining) {
    if (remaining === 0) { result.push([...path]); return; }
    for (let i = start; i < nums.length; i++) {
      if (nums[i] > remaining) break;        // prune: bigger numbers won't fit either
      path.push(nums[i]);
      backtrack(i, remaining - nums[i]);     // i, not i + 1: reuse allowed
      path.pop();
    }
  }
  backtrack(0, target);
  return result;
}

console.log(JSON.stringify(combinationSum([2, 3, 6, 7], 7))); // [[2,2,3],[7]]
console.log(JSON.stringify(combinationSum([2, 3, 5], 8)));    // [[2,2,2,2],[2,3,3],[3,5]]`,
        },
      ],
      output: `**Subsets of [1,2,3]:** the recursion saves \`[]\`, then goes \`[1]\` → \`[1,2]\` → \`[1,2,3]\`, backs up to \`[1]\` and tries \`[1,3]\`, then starts again with \`[2]\`, \`[2,3]\` and finally \`[3]\`. 8 subsets = 2^3.

**Permutations:** every number gets a turn in the first position; the \`used\` array prevents using a number twice in one ordering. 3! = 6 results.

**Combination Sum dry run (target 7):** 2 → 2,2 → 2,2,2 (remaining 1; 2 > 1 → prune) → back → 2,2,3 → remaining 0 → **save**. Later paths like 2,3,... fail, 3,3 leaves 1 (pruned), and 7 alone hits 0 → **save**. Starting each loop at \`i\` (not 0) means \`[3,2,2]\` is never generated as a duplicate of \`[2,2,3]\`.

**Complexity:** Subsets O(n · 2^n), Permutations O(n · n!), Combination Sum exponential in target / smallest candidate. Space O(n) for the recursion path (plus the output).`,
      questions: [
        { q: 'What is backtracking?', a: 'A DFS over choices: make a choice, recurse, then undo it and try the next choice. It systematically generates all candidates and abandons branches that cannot work (pruning).' },
        { q: 'Why do you push a copy of the path?', a: 'The `path` array is reused and changed by every step. Pushing it directly stores a reference, so all saved results would end up showing the same (finally empty) array.' },
        { q: 'How do you avoid duplicate results when the input has duplicates?', a: 'Sort the input, then in the loop skip `nums[i]` if `i > start && nums[i] === nums[i - 1]`, so the same value is not chosen twice at the same position in the decision tree.' },
        { q: 'What is the time complexity of generating all subsets?', a: 'O(n · 2^n): there are 2^n subsets and copying each takes up to O(n). You can\'t do better because the output itself is that big.' },
        { q: 'Backtracking vs dynamic programming?', a: 'Backtracking lists all solutions (or searches for one) by exploring choices. DP counts or optimizes when subproblems overlap. If the question is "how many ways", try DP; if it is "list all ways", it is backtracking.' },
      ],
      spoken: `"Backtracking is how I generate all combinations, subsets or permutations. I keep a current path and a recursive function. At each step I loop over the available choices: I add one to the path, recurse, then remove it again — choose, explore, un-choose. When the path is a complete answer I save a copy of it. For subsets I start the loop from the next index; for permutations I track which numbers are used; for combination sum I recurse with the remaining target and prune when a number is too big. The complexity is exponential because the number of answers is exponential."`,
      mistakes: [
        'Pushing `path` instead of `[...path]` into the result.',
        'Forgetting to undo the choice (`path.pop()`, `used[i] = false`) after the recursive call.',
        'Combination Sum: starting the loop at 0 each time, which produces the same combination in different orders.',
        'Not sorting before pruning with `break` — the break is only valid when later candidates are larger.',
        'Follow-up trap: "Can you generate subsets without recursion?" Yes: iterate over bitmasks from 0 to 2^n − 1; bit i set means include `nums[i]`. Or start with `[[]]` and, for each number, add it to a copy of every existing subset.',
      ],
      takeaway: 'Backtracking = choose → explore → un-choose; save copies, prune early, and expect exponential output.',
    },
    {
      id: 'tries',
      title: 'Tries (Prefix Trees)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'A tree where each edge is a character; insert and search take O(word length), and all words with a prefix share one path — great for autocomplete.',
      what: `A **trie** (say "try", from re**trie**val) is a tree for storing strings. Each node represents one character, and the path from the root to a node spells a **prefix**. A node has a flag \`isEnd\` to mark that a full word ends there.

Operations, where L = length of the word:
- \`insert(word)\` — walk down, creating missing child nodes → **O(L)**.
- \`search(word)\` — walk down; the word exists if the path exists and the last node has \`isEnd\` → **O(L)**.
- \`startsWith(prefix)\` — the path exists → **O(L)**.

The speed doesn't depend on how many words are stored, only on the word length.

#### Deeper version
Children can be stored in a **Map** / object (flexible, any characters) or a fixed 26-slot array (fast, lowercase only). Space can be large: up to O(total characters × alphabet size) in the worst case, which is the main trade-off versus a hash Set of words.

Why not just a Set? A Set answers "is this exact word present?" in O(L) too, but it can't answer "which words start with 'app'?" without scanning every word. A trie gives all words with a prefix by walking to the prefix node and doing DFS below it.

Classic problems: Implement Trie, Design Add and Search Words (with \`.\` wildcard → DFS over all children at that position), **Word Search II** (put all target words in a trie and DFS the grid once — much faster than searching each word separately), Replace Words, and autocomplete / search-suggestions systems. Real-world: autocomplete in search bars, IP routing (longest prefix match), spell checkers.`,
      why: `Tries come up in autocomplete and search-suggestion questions, which are natural for full-stack engineers (typeahead search boxes). They also appear as a "design a data structure" question and as the trick behind Word Search II.`,
      analogy: `A trie is like the index of a printed dictionary organised letter by letter: go to the "a" section, then "ap", then "app" — all words starting with "app" are in one place under that tab. You never look at words that start with "b".`,
      code: [
        {
          title: 'Implement Trie + autocomplete',
          lang: 'javascript',
          code: `class TrieNode {
  constructor() {
    this.children = new Map(); // char -> TrieNode
    this.isEnd = false;        // a word ends here
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  #walk(prefix) {               // returns the node at the end of prefix, or null
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) { const n = this.#walk(word); return !!n && n.isEnd; }
  startsWith(prefix) { return this.#walk(prefix) !== null; }

  // All words that start with prefix (DFS below the prefix node)
  suggest(prefix) {
    const start = this.#walk(prefix), out = [];
    const dfs = (node, path) => {
      if (node.isEnd) out.push(path);
      for (const [ch, child] of node.children) dfs(child, path + ch);
    };
    if (start) dfs(start, prefix);
    return out;
  }
}

const trie = new Trie();
for (const w of ['apple', 'app', 'apply', 'ape', 'bat']) trie.insert(w);
console.log(trie.search('app'), trie.search('appl')); // true false
console.log(trie.startsWith('appl'));               // true
console.log(trie.suggest('app'));                   // [ 'app', 'apple', 'apply' ]
console.log(trie.suggest('c'));                     // []`,
        },
      ],
      output: `After inserting the five words, "apple", "app", "apply" and "ape" share the path a → p. \`search('app')\` is true because the node after "app" has \`isEnd\`. \`search('appl')\` is false: the path exists (it's part of "apple" and "apply") but no word ends there — which is exactly why \`startsWith('appl')\` is true.

\`suggest('app')\` walks to the "app" node and collects every word below it: \`['app', 'apple', 'apply']\` (Map keeps insertion order, so "e" from "apple" comes before "y" from "apply"). There is no "c" path, so it returns \`[]\`.

**Complexity:** insert, search and startsWith O(L). Suggest is O(L + size of the subtree). Space O(total characters stored).`,
      questions: [
        { q: 'What is a trie and when would you use one?', a: 'A tree where each node is a character and paths spell prefixes. Use it when you need fast prefix queries: autocomplete, spell check, word games, longest-prefix matching.' },
        { q: 'Trie vs hash set of words?', a: 'Both check an exact word in O(L). A trie also answers "all words with this prefix" efficiently and shares memory for common prefixes, but each node has overhead, so it can use more memory than a Set.' },
        { q: 'Why do you need the isEnd flag?', a: 'A path can exist because it is the prefix of a longer word. `isEnd` marks that a complete word ends at that node, so "app" is found only if it was actually inserted.' },
        { q: 'How do you support a "." wildcard in search?', a: 'At a "." position, recursively try every child of the current node. If any branch matches the rest of the word, return true. Worst case it visits many nodes, but normal letters stay O(1) per step.' },
      ],
      spoken: `"A trie, or prefix tree, stores strings character by character. Each node has a map of children and an end-of-word flag. Inserting or searching a word walks down one node per character, so it's O(length of the word), regardless of how many words are stored. The big advantage over a hash set is prefix queries: to autocomplete 'app', I walk to that node and DFS below it to collect every word. I'd use it for a typeahead search box, and it's the trick behind Word Search II, where I put all words in a trie and search the grid once."`,
      mistakes: [
        'Forgetting the `isEnd` flag, so every prefix of an inserted word is reported as a word.',
        'Saying a trie is always more memory-efficient — node objects with Maps can use a lot of memory.',
        'Returning `node.isEnd` without checking the node exists (crash on a missing path).',
        'Follow-up trap: "How would you rank autocomplete suggestions by popularity?" Store a count or score on end nodes (or the top-k suggestions cached at each node) and sort or heap the candidates — that is how real typeahead systems stay fast.',
      ],
      takeaway: 'A trie gives O(word length) insert/search and cheap prefix lookups — the go-to structure for autocomplete.',
    },
    {
      id: 'lru-cache',
      title: 'Design Problem: LRU Cache',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A fixed-size cache that evicts the least recently used key; O(1) get/put with a hashmap + doubly linked list — or a JavaScript Map, which keeps insertion order.',
      what: `**LRU Cache** (Least Recently Used): a cache with a fixed **capacity**. \`get(key)\` returns the value (or -1) and marks the key as **recently used**. \`put(key, value)\` inserts or updates; if the cache is over capacity, it **evicts** the key that was used **least recently**. Both must be **O(1)**.

Classic design: a **hashmap** (key → node) for O(1) lookup, plus a **doubly linked list** ordered from most recent to least recent. On access, move the node to the front (O(1) with \`prev\`/\`next\` pointers). To evict, remove the node at the back.

**JavaScript shortcut:** a \`Map\` remembers **insertion order**. To mark a key as recent, \`delete\` it and \`set\` it again — it moves to the end. The least recently used key is the **first** key: \`map.keys().next().value\`. All of these are O(1).

#### Deeper version
Interviewers sometimes say "don't use the Map ordering trick" — then build the doubly linked list with **dummy head and tail** nodes so you never special-case empty lists. Each node stores \`key\` too, so on eviction you can delete it from the hashmap.

Variants: **LFU** (least frequently used — evict by count, ties by recency; needs a Map of frequency → ordered set), **TTL caches** (expire after time), and thread-safe caches. Real-world: browser caches, CDN edge caches, Redis \`maxmemory-policy allkeys-lru\` (Redis uses an approximated LRU by sampling keys), memoizing expensive API/LLM calls in a Node server, and React Query / SWR caches. For a MERN engineer this is a great place to connect DSA to real systems.`,
      why: `LRU Cache is one of the most asked design-a-data-structure questions, and it directly tests combining two structures to get O(1) for everything. It's also very practical: caching expensive database or LLM calls is everyday backend work.`,
      analogy: `Your desk only fits 3 books. Every time you read a book, you put it on top of the pile. When you need space for a new book, you remove the one at the bottom of the pile — the one you haven't touched for the longest time.`,
      code: [
        {
          title: 'LRU Cache with a JavaScript Map',
          lang: 'javascript',
          code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // keeps insertion order: first = least recent
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);       // move to the end = most recent
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const lru = this.map.keys().next().value; // first key = least recent
      this.map.delete(lru);
    }
  }
}

const cache = new LRUCache(2);
cache.put(1, 'one');
cache.put(2, 'two');
console.log(cache.get(1)); // one  (1 is now most recent)
cache.put(3, 'three');     // evicts 2
console.log(cache.get(2)); // -1
cache.put(4, 'four');      // evicts 1
console.log(cache.get(1), cache.get(3), cache.get(4)); // -1 three four`,
        },
        {
          title: 'LRU Cache with a hashmap + doubly linked list',
          lang: 'javascript',
          code: `class Node {
  constructor(key, value) { this.key = key; this.value = value; this.prev = null; this.next = null; }
}

class LRUCacheDLL {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();               // key -> Node
    this.head = new Node(null, null);   // dummy: most recent side
    this.tail = new Node(null, null);   // dummy: least recent side
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  #remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  #addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.#remove(node);
    this.#addToFront(node);
    return node.value;
  }
  put(key, value) {
    if (this.map.has(key)) this.#remove(this.map.get(key));
    const node = new Node(key, value);
    this.map.set(key, node);
    this.#addToFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;       // least recent real node
      this.#remove(lru);
      this.map.delete(lru.key);         // that's why nodes store their key
    }
  }
}

const c = new LRUCacheDLL(2);
c.put('a', 1); c.put('b', 2); c.get('a'); c.put('c', 3); // evicts 'b'
console.log(c.get('b'), c.get('a'), c.get('c'));        // -1 1 3`,
        },
      ],
      output: `**Map version dry run (capacity 2):** put 1, put 2 → order [1, 2]. get(1) moves 1 to the end → [2, 1]. put 3 → [2, 1, 3], size 3 > 2 → evict the first key, **2** → [1, 3]. get(2) → -1. put 4 → [1, 3, 4] → evict **1** → [3, 4]. So get(1) is -1, get(3) is "three", get(4) is "four".

**Linked list version:** after put a, put b and get a, the list is head ⇄ a ⇄ b ⇄ tail. Putting c adds it to the front: c ⇄ a ⇄ b. Size 3 > 2 → remove \`tail.prev\`, which is **b**. So get('b') → -1, while a and c are still there.

**Complexity:** get and put are O(1) in both versions. Space O(capacity).`,
      questions: [
        { q: 'Why a hashmap plus a doubly linked list?', a: 'The hashmap finds a key\'s node in O(1). The doubly linked list keeps recency order and lets you remove a node from the middle and add it to the front in O(1), because each node knows its previous and next neighbours.' },
        { q: 'Why does the JavaScript Map approach work?', a: 'Map iterates keys in insertion order. Deleting and re-setting a key moves it to the end (most recent), and the first key from `map.keys()` is the least recent. All operations are O(1).' },
        { q: 'Why does each linked list node store its key?', a: 'When you evict the tail node, you must also delete its entry from the hashmap, and you need the key to do that.' },
        { q: 'LRU vs LFU?', a: 'LRU evicts the item not used for the longest time. LFU evicts the item used the fewest times (ties broken by recency). LFU protects popular items but is more complex to implement in O(1).' },
      ],
      spoken: `"An LRU cache needs O(1) get and put and must evict the least recently used key when it's full. The classic design is a hashmap from key to node plus a doubly linked list ordered by recency. On get I move the node to the front; on put I insert at the front and, if I'm over capacity, remove the node at the tail and delete its key from the map. In JavaScript a Map also works, because it keeps insertion order: deleting and re-setting a key makes it most recent, and the first key is the least recent."`,
      mistakes: [
        'Using an array to track order — moving or removing items is O(n), not O(1).',
        'Forgetting to update recency on `get` (only on `put`).',
        'When updating an existing key with `put`, adding a second entry instead of replacing/moving the old one.',
        'Linked list version: not storing the key in the node, so eviction can\'t remove it from the map.',
        'Follow-up trap: "Is `map.keys().next().value` really O(1)?" Yes — it creates an iterator and reads only the first entry; it does not walk the whole Map.',
      ],
      takeaway: 'LRU = hashmap for O(1) lookup + recency order (doubly linked list, or a JS Map\'s insertion order) for O(1) move and evict.',
    },
    {
      id: 'greedy-and-bit-tricks',
      title: 'Greedy and Bit Manipulation: Jump Game, Single Number, Missing Number',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Greedy takes the best local step when you can prove it never hurts; XOR cancels equal numbers (a ^ a = 0), which finds the single or missing number in O(1) space.',
      what: `**Greedy** algorithms make the choice that looks best **right now** and never go back. They are fast and simple, but only correct when you can argue the local choice never ruins the global answer.

**1. Jump Game** — \`nums[i]\` is the max jump length from index i. Can you reach the last index? \`[2,3,1,1,4]\` → true, \`[3,2,1,0,4]\` → false.
- DP would be O(n²). Greedy: track the **farthest index reachable** so far. If you ever stand on an index beyond it, you're stuck. O(n) time, O(1) space.

**Bit manipulation** works on the binary form of numbers. The key operator is **XOR** (\`^\`): \`a ^ a = 0\`, \`a ^ 0 = a\`, and order doesn't matter.

**2. Single Number** — every number appears twice except one. Find it with O(1) extra space. XOR everything: pairs cancel to 0, leaving the single number. \`[4,1,2,1,2]\` → 4.

**3. Missing Number** — \`nums\` holds n distinct numbers from 0..n; find the missing one. \`[3,0,1]\` → 2.
- Sum formula: \`n(n+1)/2 - sum(nums)\`. Or XOR all indexes 0..n with all values — everything cancels except the missing number. O(n) time, O(1) space.

#### Deeper version
How to trust a greedy: try to find a counterexample (Coin Change with \`[1,3,4]\` breaks "take the biggest coin"). If you can't, give an "exchange argument" — any optimal answer can be changed step by step into the greedy one without getting worse. Classic correct greedies: Jump Game, Best Time to Buy and Sell Stock II, Gas Station, interval scheduling (sort by **end** time and take non-overlapping ones), assigning cookies.

Useful bit facts in JavaScript:
- \`x & 1\` → 1 if x is odd.
- \`x & (x - 1)\` removes the lowest set bit; \`x > 0 && (x & (x - 1)) === 0\` checks a power of two.
- \`x >> 1\` is floor(x / 2) for non-negative numbers (used for \`mid\` in binary search).
- JavaScript bitwise operators convert numbers to **32-bit signed integers**, so they break for values beyond about ±2.1 billion. Don't use \`|0\` or \`>>\` tricks on big numbers.`,
      why: `Greedy questions (Jump Game, Gas Station, Meeting Rooms) are common, and interviewers love asking "why is greedy correct here?" Bit tricks like Single Number and Missing Number are short, popular warm-ups that test whether you know O(1)-space tricks beyond hashmaps.`,
      analogy: `Jump Game greedy is like crossing stepping stones in a river while keeping track of "the farthest stone I could possibly reach". As long as the stone you're on is within that reach, you keep going and update the reach. XOR is like a light switch: flipping the same switch twice leaves it off, so only the switch flipped an odd number of times stays on.`,
      code: [
        {
          title: 'Jump Game — track the farthest reach',
          lang: 'javascript',
          code: `function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;            // we can't even stand here
    farthest = Math.max(farthest, i + nums[i]);
    if (farthest >= nums.length - 1) return true;
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
console.log(canJump([0]));             // true`,
        },
        {
          title: 'Single Number and Missing Number with XOR',
          lang: 'javascript',
          code: `// a ^ a = 0 and a ^ 0 = a, so pairs cancel out
function singleNumber(nums) {
  let x = 0;
  for (const n of nums) x ^= n;
  return x;
}
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([7]));             // 7

function missingNumber(nums) {
  let x = nums.length;                 // include n itself
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}
const missingBySum = (nums) => (nums.length * (nums.length + 1)) / 2 - nums.reduce((a, b) => a + b, 0);

console.log(missingNumber([3, 0, 1]));                    // 2
console.log(missingBySum([9, 6, 4, 2, 3, 5, 7, 0, 1]));  // 8

// Handy bit checks
const isPowerOfTwo = (x) => x > 0 && (x & (x - 1)) === 0;
const countBits = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };
console.log(isPowerOfTwo(16), isPowerOfTwo(18)); // true false
console.log(countBits(11));                      // 3 (1011 in binary)
console.log(2 ** 31 | 0);                        // -2147483648 (32-bit overflow!)`,
        },
      ],
      output: `**Jump Game dry run on \`[3, 2, 1, 0, 4]\`:** i=0 → farthest 3. i=1 → max(3, 3) = 3. i=2 → 3. i=3 → 3 + 0 = 3. i=4 > farthest 3 → we can never reach index 4 → **false**. For \`[2, 3, 1, 1, 4]\`, at i=1 farthest becomes 4 = last index → **true**.

**Single Number:** 4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = **4**.

**Missing Number on \`[3, 0, 1]\`:** start with x = 3, then XOR indexes 0, 1, 2 and values 3, 0, 1. Every number except 2 appears twice and cancels → **2**. The sum version gives 45 − 37 = **8** for the second example.

The last line shows the JavaScript caveat: bitwise operators work on 32-bit signed integers, so \`2 ** 31 | 0\` overflows to a negative number.

**Complexity:** all O(n) time and O(1) space (\`countBits\` is O(number of set bits)).`,
      questions: [
        { q: 'When is a greedy algorithm correct?', a: 'When making the locally best choice can never block the best overall answer. You show it by trying counterexamples and by an exchange argument: any optimal solution can be turned into the greedy one without getting worse.' },
        { q: 'Why does XOR find the single number?', a: 'XOR is commutative and associative, `a ^ a = 0` and `a ^ 0 = a`. XOR-ing all numbers cancels every pair, leaving only the one that appears once. O(n) time, O(1) space.' },
        { q: 'Missing Number: sum formula or XOR?', a: 'Both are O(n) time and O(1) space. The sum formula can overflow in fixed-size integer languages for huge n; XOR never overflows. In JavaScript the sum is safe up to `Number.MAX_SAFE_INTEGER`.' },
        { q: 'What is a JavaScript-specific gotcha with bitwise operators?', a: 'They convert numbers to 32-bit signed integers. Values above 2^31 − 1 wrap around to negatives, so `x >> 1` or `x | 0` is unsafe for large numbers. Use `Math.floor` or BigInt instead.' },
      ],
      spoken: `"Greedy algorithms take the best local step and never look back, so I only use them when I can argue the local choice never hurts — and I try a quick counterexample first. For Jump Game, I track the farthest index I can reach; if I ever land beyond it, I'm stuck. That's O(n) and O(1) space. For Single Number I XOR all values: equal pairs cancel to zero and the single number remains. Missing Number works the same way by XOR-ing indexes with values, or with the sum formula. In JavaScript I remember that bitwise operators work on 32-bit signed integers."`,
      mistakes: [
        'Using greedy without checking a counterexample (e.g. biggest-coin-first for Coin Change).',
        'Jump Game: simulating every jump with recursion or BFS (O(n²)) when one pass with a "farthest" variable is enough.',
        'Single Number: using a Map or Set when the problem asks for O(1) extra space.',
        'Using bitwise tricks like `n >> 1` or `n | 0` on numbers larger than 2^31 in JavaScript.',
        'Follow-up trap: "Jump Game II — minimum number of jumps?" Still greedy (BFS by levels): track the current jump\'s end and the farthest reach; when you pass the current end, add a jump and extend the end to the farthest. O(n).',
      ],
      takeaway: 'Greedy only when you can justify the local choice (Jump Game: track the farthest reach); XOR cancels pairs for O(1)-space Single/Missing Number.',
    },
  ],
  rapidFire: [
    { q: 'Time complexity of array access by index?', a: 'O(1).' },
    { q: 'Time complexity of push/pop vs shift/unshift in JS?', a: 'push/pop are O(1) amortized; shift/unshift are O(n) because every element moves.' },
    { q: 'Time complexity of Map/Set get, set, has?', a: 'O(1) on average (O(n) worst case with many collisions).' },
    { q: 'Time complexity of arr.includes or indexOf?', a: 'O(n) — they scan the array. Inside a loop that becomes O(n²).' },
    { q: 'Time complexity of JavaScript sort?', a: 'O(n log n). V8 uses TimSort, which is stable.' },
    { q: 'What does [10, 9, 1].sort() return?', a: '[1, 10, 9] — it sorts as strings. Use (a, b) => a - b for numbers.' },
    { q: 'Binary search complexity and precondition?', a: 'O(log n) time; the data (or the yes/no condition) must be sorted/monotonic.' },
    { q: 'Merge sort time and space?', a: 'O(n log n) time always, O(n) extra space, stable.' },
    { q: 'Quick sort time and space?', a: 'O(n log n) average, O(n²) worst case; in place with O(log n) average stack; not stable.' },
    { q: 'Space complexity of recursion?', a: 'At least O(max recursion depth) for the call stack.' },
    { q: 'Naive recursive Fibonacci complexity, and with memoization?', a: 'O(2^n) naive; O(n) with memoization.' },
    { q: 'Clue: "find a pair / have I seen this?"', a: 'Hashmap or Set.' },
    { q: 'Clue: "sorted array, find a pair"', a: 'Two pointers from both ends.' },
    { q: 'Clue: "longest/shortest contiguous subarray or substring"', a: 'Sliding window.' },
    { q: 'Clue: "subarray sum equals K with negative numbers"', a: 'Prefix sums + hashmap seeded with {0: 1}.' },
    { q: 'Clue: "matching brackets / next greater element"', a: 'Stack (monotonic stack for next greater).' },
    { q: 'Clue: "shortest path in an unweighted graph or grid"', a: 'BFS with a queue.' },
    { q: 'Clue: "count connected regions / explore everything connected"', a: 'DFS or BFS flood fill with a visited set.' },
    { q: 'Clue: "top K / Kth largest / always take the smallest next"', a: 'Heap (priority queue).' },
    { q: 'Clue: "how many ways / minimum cost / max profit with choices"', a: 'Dynamic programming.' },
    { q: 'Clue: "list all subsets / permutations / combinations"', a: 'Backtracking.' },
    { q: 'Clue: "tasks with dependencies / prerequisites"', a: 'Topological sort (Kahn\'s algorithm), which also detects cycles.' },
    { q: 'Clue: "prefix search / autocomplete"', a: 'Trie.' },
    { q: 'Two Sum optimal complexity?', a: 'O(n) time, O(n) space with a Map of value → index.' },
    { q: '3Sum optimal complexity?', a: 'O(n²): sort, fix one number, two pointers for the rest, skip duplicates.' },
    { q: 'Container With Most Water — which pointer moves?', a: 'The shorter wall, because it limits the height. O(n).' },
    { q: 'Best Time to Buy and Sell Stock in one line?', a: 'Track the minimum price so far and the best price − min. O(n), O(1).' },
    { q: 'Kadane\'s algorithm in one line?', a: 'current = max(x, current + x); best = max(best, current). Start both at nums[0].' },
    { q: 'Product of Array Except Self without division?', a: 'Left prefix products pass, then right suffix products pass. O(n), O(1) extra.' },
    { q: 'Longest Substring Without Repeating Characters approach?', a: 'Sliding window + Map of last index; jump left past a duplicate inside the window. O(n).' },
    { q: 'Valid Parentheses approach?', a: 'Push openers on a stack; each closer must match the popped opener; stack must end empty. O(n).' },
    { q: 'Min Stack trick?', a: 'Store the current minimum with every pushed value, so getMin is O(1).' },
    { q: 'Reverse a linked list in one breath?', a: 'prev = null; for each node: save next, node.next = prev, prev = node, node = next. Return prev.' },
    { q: 'Detect a cycle in a linked list with O(1) space?', a: 'Floyd\'s fast and slow pointers: if they meet, there is a cycle.' },
    { q: 'Which tree traversal gives sorted output for a BST?', a: 'In-order (left, node, right).' },
    { q: 'DFS vs BFS space on a tree?', a: 'DFS uses O(h) (height); BFS uses O(w) (widest level).' },
    { q: 'How to validate a BST correctly?', a: 'Pass (min, max) bounds down the recursion, or check that in-order is strictly increasing.' },
    { q: 'BFS/DFS complexity on a graph?', a: 'O(V + E) time, O(V) space.' },
    { q: 'When to mark a node visited in BFS?', a: 'When you enqueue it, so it is never added twice.' },
    { q: 'Does JavaScript have a built-in heap/priority queue?', a: 'No. Write a small MinHeap (array, bubble up / sink down) or ask to assume one.' },
    { q: 'Heap operation costs?', a: 'peek O(1), push O(log n), pop O(log n), heapify O(n).' },
    { q: 'Kth largest with a heap?', a: 'Min-heap of size k; its top is the Kth largest. O(n log k). Quickselect is O(n) average.' },
    { q: 'Memoization vs tabulation?', a: 'Memoization = top-down recursion + cache; tabulation = bottom-up loop filling a table.' },
    { q: 'DP complexity formula?', a: 'Number of states × work per state.' },
    { q: 'Coin Change recurrence?', a: 'dp[a] = 1 + min(dp[a − coin]) with dp[0] = 0; greedy fails (coins [1,3,4], amount 6).' },
    { q: 'House Robber recurrence?', a: 'dp[i] = max(dp[i − 1], dp[i − 2] + nums[i]) — skip or rob.' },
    { q: 'Merge Intervals approach?', a: 'Sort by start; extend the last interval\'s end with max if overlapping, else push. O(n log n).' },
    { q: 'LRU Cache in O(1)?', a: 'Hashmap + doubly linked list, or a JS Map (delete + set moves a key to most recent; first key is LRU).' },
    { q: 'Single Number in O(1) space?', a: 'XOR all numbers: pairs cancel (a ^ a = 0).' },
    { q: 'What size n hints at which complexity?', a: 'n ≤ 20 → O(2^n) ok; n ≤ 10^3 → O(n²) ok; n ~ 10^5–10^6 → O(n log n) or O(n).' },
  ],
};
