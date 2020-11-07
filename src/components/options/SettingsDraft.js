import React from 'react'

function SettingsDraft(props) {

    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    return (
        <div>
            <label>Cards to select from:</label>
            <span className="draft-option">
                <input type="range" min="2" max="15" step="1" value={props.draftCount} className="slider" name="draftCount1" onChange={handleChange}/>
                <span className="sliderValue">{props.draftCount}</span>
            </span>
        </div>
    )
}

export default SettingsDraft