const hre = require('hardhat')

async function main() {
  try {
    const Upload = await hre.ethers.getContractFactory('Upload')
    const upload = await Upload.deploy()
    await upload.deployed()
    console.log('Library deployed to:', upload.address)
  } catch (err) {
    console.error(err) // Use 'err' to log the caught error
    process.exitCode = 1
  }
}

main()
