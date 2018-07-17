const Neon = require('@cityofzion/neon-js');
const neon = Neon.default;
const config = {
  "contract-scripthash": "eac77fffef895a3bc90ca97437f30f9794e007da",
  "neo-rpc-seed": "http://seed2.neo.org:20332",
  "addresses": ['AYus7RaBLTBAzf4xid5WefSxQmTeeQHsR4', 'AcpoeLaicSDJSyv9ZEtLnGXKzqthnExsud']
};

// expect balance to be 400,000,000 (ML project key)
// groupMax to be 200000 (Default)
// groupUnlockBlock to be 1581700
AccountPortalData(config.addresses[0], 1);

// expect balance to be 0
// groupMax to be 200000 (Default)
// groupUnlockBlock to be 1600000
AccountPortalData(config.addresses[1], 2);

// expect balance to be 0
// groupMax to be 300000
// groupUnlockBlock to be 0
AccountPortalData(config.addresses[1], 3);


function AccountPortalData(walletAddress, groupNumber) {
  const scriptHash = Neon.wallet.getScriptHashFromAddress(walletAddress);
  const getBalance = {
    scriptHash: config['contract-scripthash'],
    operation: 'balanceOf',
    args: [Neon.u.reverseHex(scriptHash)]
  };
  const getGroupMaxContribution = {
    scriptHash: config['contract-scripthash'],
    operation: 'GetGroupMaxContribution',
    args: [groupNumber]
  };
  const getGroupUnlockBlock = {
    scriptHash: config['contract-scripthash'],
    operation: 'GetGroupUnlockBlock',
    args: [groupNumber]
  };
  const getCurrentBlockHeight = {
    scriptHash: config['contract-scripthash'],
    operation: 'GetBlockHeight',
    args: []
  };

  const script = neon.create.script(getBalance, getGroupMaxContribution, getGroupUnlockBlock, getCurrentBlockHeight);
  Neon.rpc.Query.invokeScript(script)
    .execute(config['neo-rpc-seed'])
    .then(res => {
      const stack = res.result.stack;
      const contractValues = {
        userBalance: Neon.u.fixed82num(stack[0].value === '' ? '00' : stack[0].value),
        groupMax: parseInt(Neon.u.reverseHex(stack[1].value), 16),
        groupUnlockBlock: parseInt(Neon.u.reverseHex(stack[2].value), 16) || 0,
        blockHeight: stack[3].value
      };
      // console.log(stack);
      console.log(contractValues);
    });
}
