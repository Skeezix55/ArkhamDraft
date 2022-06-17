import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'

function UpgradeChaosSettings(props) {    
    const draftType = useSelector(state => state.settings.draftType)
    const draftWeighting = useSelector(state => state.settings.draftWeighting)
    const draftXP = useSelector(state => state.settings.draftXP)
    
    const displayXP = props.displayXP

    const dispatch = useDispatch()
    
    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
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
        </div>
    )
}

export default UpgradeChaosSettings