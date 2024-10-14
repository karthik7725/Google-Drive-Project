const getdata = async () => {
  try {
    let imgDataArr = []
    if (othAcc) {
      imgDataArr = await contract.display(othAcc)
    } else {
      imgDataArr = await contract.display(account)
    }

    // if (imgDataArr.length > 0) {
    //   const images = imgDataArr.map((item, i) => {
    //     const fileType = item.fileType
    //     if (fileType === 'application/pdf') {
    //       return (
    //         <div key={i}>
    //           <button onClick={() => window.open(item.url)} className="pdf-btn">
    //             <img src={pdfIcon} alt="pdf-icon" className="pdf-icon" />
    //           </button>
    //           <div className="pdf-name">{item.fileName}</div>
    //         </div>
    //       )
    //     } else {
    //       return (
    //         <a href={item.url} key={i} target="_blank" rel="noreferrer">
    //           <img
    //             key={i}
    //             src={item.url}
    //             alt="new"
    //             className="image-list"
    //           ></img>
    //           <div className="pdf-name">{item.fileName}</div>
    //         </a>
    //       )
    //     }
    //   })
    //   setImageList(images)
    // } else {
    //   alert('No image to display')
    // }
  } catch (e) {
    alert("You don't have access")
  }
}
