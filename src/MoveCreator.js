import './MoveCreator.css';

function UploadSkeleton() {
	return (
		<>
		<div className="Title">
			<h1 class="TitleText">Move Creator</h1>
		</div>
    <div className="buttonandimg">
        <div className="ButtonContainer">
            <button className="Buttons">Browse</button>
            <button className="Buttons">Dance Bank</button>
            <button className="Buttons">Move Bank</button>
        </div>
        <div className="homeImage">
            <img src="nothing.jpg" alt="homepage image" width="500" height="500"/>
        </div>
    </div>
		</>
	);
}

export default HomeScreen