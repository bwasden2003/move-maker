import './MoveCreator.css';

function MoveCreator() {
	return (
		<>
		<div className="MTitle">
			<h1 class="MTitleText">Move Creator</h1>
		</div>
    <div className="MPageContent">
        <div className="MUploadVideoTitleContainer">
            <h2 class="MBoldText">Title</h2>
            <input type="text" id="title" name="title" placeholder='My Dance' class="MDanceInput"></input>
            <div class="MUploadVideoContainer">
                <h2 class="MRegText">Upload Video</h2>
                <h3 class="MSmallText">Upload a video to convert into a dance. 
                    Be sure the dancer's full body is in frame.
                </h3>
                <div class="MImportFileContainer"
                onDragOver={(e) => e.preventDefault()} 
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                        console.log('File dropped:', file);
                    } else {
                        alert('Please drop a valid video file.');
                    }
                }}>
                    <h2 class="MDragText">Drag and drop video here</h2>
                    <h2 class="MOrText">OR</h2>
                    <label for="file">Browse Files</label>
                    <input class="MChooseFile" type="file" id="file" name="file" accept="video/*" ></input>
                </div>
            </div>
        </div>
        <div className = "MEditSaveContainer">
            <div class="saveButtons">
                <button class="MSaveButton">Save</button>
            </div>
            <div class="MVideoPreviewContainer">
                <h2 class="MRegText">Edit Movements</h2>
                <h2 class="MSmallText">The movements from your video will be applied to this skeleton. Edit a frame by dragging motion points.</h2>
                {/* <video controls width="250" height="250"></video> */}
            </div>

        </div>
    </div>
		</>
	);
}

export default MoveCreator