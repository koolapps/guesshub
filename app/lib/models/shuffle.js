// Given an array return as little as possible consequitive items.
// Note: doesn't care about maintaining order.
function shuffle(arr, id) {

  // Given an array return a unique array and the dups.
  function unique(arr) {
    var m = {};
    var dups = [];
    var ret = [];

    for (var i = 0, item; item = arr[i]; i++) {
      if (!m[id(item)]) {
        ret.push(item);
        m[id(item)] = true;
      } else {
        dups.push(item);
      }
    }
    return { arr: ret, dups: dups };
  }

  function isEqual(a, b) {
    // Don't care about nulls to simplify loop.
    if (a == null || b == null) {
      return false;
    } else {
      return id(a) === id(b);
    }
  }

  var tmp = unique(arr);
  arr = tmp.arr;
  dups = tmp.dups;
  var unshifted = 0;
  while (dups.length) {
    var item = dups.pop();
    var broke = false;
    for (var i = 0; i < arr.length; i++) {
      if (!isEqual(item, arr[i]) && !isEqual(item, arr[i - 1])) {
        arr.splice(i, 0, item);
        broke = true;
        break;
      }
    }
    if (!broke) {
      // If we couldn't find a place for this dup in the return array
      // then unshift in the orignal dups maybe in the future we could
      // find a place, however, make sure we don't get stuck.
      if (unshifted < dups.length) {
        dups.unshift(item);
        unshifted++;
      } else {
        arr.push(item);
      }
    }
  }

  return arr;
}

module.exports = shuffle;

// Uncomment and run in node for test.
// if (typeof window === 'undefined') {
//   var assert = require('assert');
//   function id(a) {
//     return a;
//   }
//   assert.deepEqual(shuffle([1, 1, 2, 2], id), [1, 2, 1, 2]);
//   assert.deepEqual(shuffle([1, 1, 2, 2, 2], id), [2, 1, 2, 1, 2]);
//   assert.deepEqual(shuffle([1, 1, 2, 2, 2, 3, 3], id),  [1, 2, 3, 2, 1, 2, 3]);
//   assert.deepEqual(shuffle([1, 1, 1, 1, 1], id),  [1, 1, 1, 1, 1]);
//   assert.deepEqual(shuffle([1, 1, 1, 1, 2], id),  [1, 2, 1, 1, 1]);
// }
