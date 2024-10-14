// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Upload {
  struct Access {
    address user;
    bool access;
  }
  mapping(address => Access[]) accessList;
  mapping(address => string[]) value;
  mapping(address => mapping(address => bool)) ownership;
  mapping(address => mapping(address => bool)) previousData;

  // external -> externally accessible outside by users ( not possible within the contract tho )
  // calldata -> not read to memory , saves memory , immutable tho

  function add(address user, string calldata url) external {
    value[user].push(url);
  }

  function allow(address user) external {
    ownership[msg.sender][user] = true; //permanent thing to keep at start if allow
    if (previousData[msg.sender][user] == true) {
      //old user
      for (uint i = 0; i < accessList[msg.sender].length; i++) {
        if (accessList[msg.sender][i].user == user) {
          accessList[msg.sender][i].access = true;
        }
      }
    } else {
      accessList[msg.sender].push(Access(user, true));
      previousData[msg.sender][user] = true;
    }
  }
  function disallow(address user) external {
    ownership[msg.sender][user] = false;
    for (uint i = 0; i < accessList[msg.sender].length; i++) {
      if (accessList[msg.sender][i].user == user) {
        accessList[msg.sender][i].access = false;
      }
    }
  }

  function display(address user) external view returns (string[] memory) {
    require(
      user == msg.sender || ownership[user][msg.sender],
      'You dont have access!'
    );
    return value[user];
  }
  function shareAccess() public view returns (Access[] memory) {
    return accessList[msg.sender];
  }
}
//library deployed to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
