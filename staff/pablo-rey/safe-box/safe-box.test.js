describe ("safe-box", function (){

  it("should return a function", function () {
    var safe = safeBox();

    expect(typeof safe, "function");
  });

  it("should return a safe with 123 default password", function () {
    var safe = safeBox();
    safe('123');
  });
  
  it("should throw error if password is wrong", function () {
    var safe = safeBox();

    try {
      safe('000');
      throw Error("Not checking password");
    } catch (error) {
      expect(error.message, 'wrong password');
    }
  });

  it("should returns true - if password is correct, indicating secret is saved and safe", function () {
    var secret = [1,2,3];
    var safe = safeBox();
    expect(safe('123', secret), true);
  });

  
  it("should return the secret if the password is correct and no other params supplied", function () {
    var secret = [1,2,3];
    var safe = safeBox();
    safe('123', secret);
    var retreivedSecret = safe('123');
    expect(secret, retreivedSecret);    
  });
  
  it("should change the password", function () {
    var safe = safeBox();
    expect(safe('123','456', true), true);
    safe('456');    
  })
})