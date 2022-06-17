import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'

function UpgradeDraftSettings(props) {
    const draftType = useSelector(state => state.settings.draftType)
    const draftWeighting = useSelector(state => state.settings.draftWeighting)
    const draftXP = useSelector(state => state.settings.draftXP)
    const draftCount = useSelector(state => state.settings.draftCount)
    const requireConfirmation = useSelector(state => state.settings.confirmDraft)

    const phase = parseInt(props.phase)
    const displayXP = props.displayXP
    
    const dispatch = useDispatch()

    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
    }

    function handleCountChange(event) {
        dispatch(changeSetting(event.target.name, { phase: phase, value: event.target.value }))
    }

    function handleCheckbox(event) {
        dispatch(changeSetting(event.target.name, event.target.checked))
    }

    return (
        <div>
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Type:</label>
                <span className="fbdraftsettingcenter">                    
                    <select className="fbdraftsettingselect" name="DraftType" value={draftType} onChange={handleChange}>
                        <option value="chaos">Standard chaos</option>
                        <option value="draft">Simple draft</option>
                    </select>                    
                </span>
                <span className="fbdraftsettingright"></span>
            </div>
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Weighting:</label>
                <span className="fbdraftsettingcenter">                    
                    <select className="fbdraftsettingselect" name="DraftWeighting" value={draftWeighting} onChange={handleChange}>
                        <option value="low">Prefer low XP</option>
                        <option value="medium">Default</option>
                        <option value="high">Prefer high XP</option>
                    </select>                    
                </span>
                <span className="fbdraftsettingright"></span>
            </div>
            {displayXP ? 
                <div className="fbsetting">
                    <label className="fbdraftsettingleft">XP:</label>
                    <span className="fbdraftsettingcenter">
                        <input className="fbdraftsettingnumber" name="DraftXP" type="number" value={draftXP} min="1" onChange={handleChange}></input>
                    </span>
                    <span className="fbdraftsettingright"></span>
            </div> : null}
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Cards to select from:</label>
                <span className="fbdraftsettingslider">
                    <input type="range" min="2" max="15" step="1" value={draftCount[phase-1]} name="DraftCount" onChange={handleCountChange}/>
                </span>
                <span className="fbdraftsettingslidervalue">{draftCount[phase-1]}</span>
            </div>
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Require confimation on draft:</label>
                <span className="fbdraftsettingcenter">
                    <input type="checkbox" checked={requireConfirmation} name='ConfirmDraft' onChange={handleCheckbox}/>
                </span>
                <span className="fbdraftsettingright"></span>
            </div>
        </div>
    )
}

export default UpgradeDraftSettings