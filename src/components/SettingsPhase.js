import React from 'react'

function SettingsPhase(props) {
    return (
        <div className="draftPhase">
            <h4 style={{padding: "0 0 5px 0"}}>Stage {props.phase}</h4>
            <label>Cards to select from:</label>
            <input type="range" min="1" max="15" value={props.draftCount} className="slider" name="draftCount" onChange={props.onChangeSetting}/>
            <span className="sliderValue">{props.draftCount}</span>
            <br />
            <label>Cards selected in this stage: </label>
            <input type="range" min="0" max={props.maxCards} value={props.draftCards} className="slider" name="draftCards" onChange={props.onChangeSetting}/>
            <span className="sliderValue">{props.draftCards}</span>
            <label>Include cards with limited deck slots:</label>
            <input type="checkbox" checked={props.draftUseLimited} name="draftUseLimited" className="checkbox" onChange={props.onChangeSetting}/>
        </div>
    )
}

export default SettingsPhase