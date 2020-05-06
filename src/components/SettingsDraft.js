import React from 'react'

function SettingsDraft(props) {

    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    return (
        <div className="draftSettingsDraft">
            <label>Cards to select from:</label>
            <input type="range" min="2" max="15" step="1" value={props.draftCount} className="slider" name="draftCount1" onChange={handleChange}/>
            <span className="sliderValue">{props.draftCount}</span>
        </div>
    )
}

export default SettingsDraft