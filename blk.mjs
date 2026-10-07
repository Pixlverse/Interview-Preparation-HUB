function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);
    const results = new Array(list.length);
    let done = 0;
    if (list.length === 0) return resolve([]);     // edge case

    list.forEach((item, index) => {
      Promise.resolve(item)                         // also accepts plain values
        .then((value) => {
          results[index] = value;                   // keep input order
          if (++done === list.length) resolve(results);
        })
        .catch(reject);                             // first error wins
    });
  });
}

const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
promiseAll([delay(300, 'a'), 'b', delay(100, 'c')]).then(console.log); // ['a', 'b', 'c']
promiseAll([delay(100, 'a'), Promise.reject(new Error('fail'))])
  .catch((e) => console.log(e.message)); // "fail"