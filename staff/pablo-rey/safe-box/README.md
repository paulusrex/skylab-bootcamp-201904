# safe box

## description

* branch feature/safe-box
* location staff/<name>/safe-box
* USER STORIES

```
// acceptance criterial

// 1

safeBox('123', 'my secret'); 
// returns true - if password is correct, indicating secret is saved and safe
// throw Error('wrong password') - if password is wrong

// 2

var secret = safeBox('123');
// returns secret === 'my secret' - If password is correct
// throw Error('wrong password') - if password is wrong

// 3

safeBox('123', '456', true);
// returns true - Indicating the password has successfully been changed
// throw Error('wrong password') - if password is wrong
```