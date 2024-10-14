import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import Upload from './artifacts/contracts/Upload.sol/Upload.json'
import Display from './components/Display'
import FileUpload from './components/FileUpload'
import Modal from './components/Modal'
import { Button } from './components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
function App() {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [filename, setFileName] = useState('')
  const [othAcc, setOthAcc] = useState('')
  const [imageList, setImageList] = useState([])
  const [shareAddress, setShareAddress] = useState('')
  const [accessList, setAccessList] = useState([])
  const [showAccessListDiv, setShowAccessListDiv] = useState(false)
  const fileInputRef = useRef(null)

  const fileDialogOpener = () => {
    fileInputRef.current.click()
  }
  const uploadToPinata = async (event) => {
    event.preventDefault()
    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await axios({
          method: 'POST',
          url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
          data: formData,
          headers: {
            'Content-Type': `multipart/form-data`,
            pinata_api_key: '8a949abcef730ad33bcb',
            pinata_secret_api_key:
              'c5b980fefa457435b90e13340ef04240f36246367012f1b461dd8cf9cfe9a394',
          },
        })
        const imageHash = response.data.IpfsHash
        console.log(imageHash)
        const imgurl = `https://gateway.pinata.cloud/ipfs/${imageHash}`
        if (response.status === 200) {
          const tx = await contract.add(account, imgurl) //this thing will fire ur metamask wallet to pay the gas fee
          await tx.wait()
          alert('Image uploaded successfully')
          setFileName('')
          setFile(null)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
  const retrieveFile = (event) => {
    const data = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(data) //reader is setting in image format
    reader.onloadend = () => {
      setFile(data)
    }
    setFileName(data.name)
    event.preventDefault()
  }
  const getData = async () => {
    /*

    */

    try {
      let imgDataArr = []
      if (othAcc) {
        imgDataArr = await contract.display(othAcc)
      } else {
        imgDataArr = await contract.display(account)
      }
      console.log(imgDataArr)

      const isEmpty = Object.keys(imgDataArr).length == 0
      if (!isEmpty) {
        const images = imgDataArr.map((item, i) => {
          return (
            <div className="w-[400px] h-[400px] shrink-0 grow border rounded-2xl ">
              <a href={item} key={i} target="_blank" className="">
                <img
                  key={i}
                  src={item}
                  alt="new"
                  className="image-list w-full h-full object-contain p-3"
                ></img>
              </a>
            </div>
          )
        })
        setImageList(images)
      } else {
        alert('No image found')
        return
      }
    } catch (err) {
      if (err.reason) {
        alert(err.reason) // Show the specific error message specific from smart contract ("You dont have access !")
      } else {
        console.error(err) // Other kind of error in the try block
        alert('An unexpected error occurred.')
      }
    }
  }

  ///
  ///
  ///
  ///
  const revoking = async () => {
    try {
      const res = await contract.disallow(shareAddress)
      console.log(res)
      setModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const sharing = async () => {
    try {
      const res = await contract.allow(shareAddress)
      console.log(res)
      setModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }
  const accessListFunc = async () => {
    const res = await contract.shareAccess()
    console.log(res)
    let temp = []
    res.map((value, index) => {
      if (value.access == true) {
        temp.push(value.user)
      }
    })
    // console.log(res.length)
    // console.log(res[0].length)
    setAccessList(temp)
    setShowAccessListDiv((prev) => !prev)
  }

  useEffect(() => {
    if (window.ethereum !== undefined) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const wallet = async () => {
        if (provider) {
          await provider.send('eth_requestAccounts', [])
          //
          window.ethereum.on('accountsChanged', () => {
            //auto-refresh the page when account changes
            window.location.reload()
          })
          //
          const signer = await provider.getSigner()
          const address = await signer.getAddress() //address of your connected account
          // console.log(address)
          setAccount(address)
          //
          const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
          const contract = new ethers.Contract(
            contractAddress,
            Upload.abi,
            signer
          )
          // console.log(contract)
          setContract(contract)
          setProvider(provider)
        }
      }
      provider && wallet()
    } else {
      alert('Metamask not installed')
    }
  }, [])

  return (
    <>
      <div
        className="fixed inset-0 z-[99999] bg-slate-800 bg-opacity-85 flex items-center justify-center transition-opacity duration-300 ease-in-out"
        style={{
          visibility: modalOpen ? 'visible' : 'hidden',
          opacity: modalOpen ? 1 : 0,
        }}
        onClick={() => setModalOpen(false)}
      >
        <div
          className="w-[500px] bg-white rounded-3xl overflow-hidden absolute duration-500"
          style={{
            transform: modalOpen ? 'translateY(0%)' : 'translateY(-100%)',
            opacity: modalOpen ? 1 : 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-2xl font-bold text-black tracking-tighter p-6 block">
            <div className="text-center mb-4">Share with:</div>
            <div className="flex items-center flex-col">
              <Textarea
                className="w-full mt-3 placeholder:text-gray-700 border border-gray-400 placeholder:font-normal"
                placeholder="Enter the user whom you want to share with"
                onChange={(e) => {
                  setShareAddress(e.target.value)
                }}
              />
              <div className="flex gap-2">
                <Button
                  className="mt-4 text-lg p-3 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-blue-300"
                  onClick={sharing}
                >
                  Share
                </Button>
                <Button
                  className="mt-4 text-lg p-3 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-blue-300"
                  onClick={revoking}
                >
                  Revoke
                </Button>
              </div>
            </div>
            <div className="mt-5 ">
              <span>People with already access:</span>{' '}
              <Button
                className="ml-2 mt-4 text-lg p-3 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-blue-300"
                onClick={accessListFunc}
              >
                {showAccessListDiv ? 'Hide' : 'Show'}
              </Button>
              <ul
                className="list-disc pl-5 "
                style={{
                  display: showAccessListDiv ? 'block' : 'none',
                }}
              >
                {accessList.map((value, index) => {
                  return (
                    <li key={index} className="text-lg font-mono">
                      {value}
                    </li>
                  )
                })}
              </ul>
            </div>
          </span>
        </div>
      </div>
      <div className="">
        <Button
          className="text-2xl p-4 m-2 rounded-r-2xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-zinc-700"
          disabled={!window.ethereum}
          onClick={() => setModalOpen(true)}
        >
          Share
        </Button>
        {/* Wrap spans inside the main div */}
        <div className="main  w-[800px] flex flex-col mx-auto items-center p-2">
          <div className="size-20">
            <img src="../public/Google-Drive-Logo.png" alt="" />
          </div>
          <span className="text-6xl font-bold font-sans tracking-tighter ">
            Google Drive 2.0
          </span>
          <div className="mx-auto  flex flex-col mt-20 gap-y-2 tracking-tighter font-semibold">
            {' '}
            <span className="text-xl">
              Account connected :<span className="ml-3"> {account}</span>
            </span>
            <span className="text-xl">
              Upload Image :
              <Button
                className="text-lg p-3 m-2 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-zinc-700"
                onClick={fileDialogOpener}
                disabled={file || !window.ethereum}
              >
                Choose Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={retrieveFile}
                style={{ display: 'none' }}
              />
              <Button
                className="text-lg p-3 m-2 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-zinc-700"
                onClick={uploadToPinata}
                disabled={!file}
              >
                Upload
              </Button>
            </span>
            <span className="text-xl">
              Image :
              {file ? (
                <span className="ml-3"> {filename}</span>
              ) : (
                <span className="ml-3"> No image selected </span>
              )}
            </span>
            <span className="flex text-xl mt-2">
              {' '}
              Address:{' '}
              <Textarea
                className="inline placeholder:text-gray-700 ml-2 border border-gray-900 blinking-caret"
                placeholder="Enter the user addresss"
                onChange={(e) => {
                  setOthAcc(e.target.value)
                }}
              />
              <Button
                className="text-lg p-3 m-2 rounded-xl border border-gray-700 hover:shadow-xl duration-300 hover:bg-zinc-700"
                onClick={getData}
                disabled={!window.ethereum}
              >
                Get Data
              </Button>
            </span>
          </div>
          <div className="flex w-[1200px] overflow-x-scroll no-scrollbar mt-5">
            {imageList}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
