import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeSetting } from '../features/settings/settingsSlice'

function BuildChaosSettings(props) {
    const { allowPhased } = props

    const draftType = useSelector(state => state.settings.draftType)
    const myriadCount = useSelector(state => state.settings.myriadCount)

    const dispatch = useDispatch()

    function handleChange(event) {
        dispatch(changeSetting(event.target.name, event.target.value))
    }

    const myriadText = myriadCount === 1 ? 'card' : 'cards'

    return (
        <div>
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Type:</label>
                <span className="fbdraftsettingcenter">
                    <select className="fbdraftsettingselect" name="DraftType" value={draftType} onChange={handleChange}>
                        <option value="chaos">Standard chaos</option>
                        <option value="draft">Simple draft</option>
                        {allowPhased === 'true' ? <option value="phaseDraft">Draft in stages</option> : null}
                    </select>
                </span>
                <span className="fbdraftsettingright"></span>
            </div>
            <div className="fbsetting">
                <label className="fbdraftsettingleft">Drafting myriad adds:</label>
                <span className="fbdraftsettingcenter">
                    <select className="fbdraftsettingselect" name="MyriadCount" value={myriadCount} onChange={handleChange}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </span>
                <span className="fbdraftsettingright"> {myriadText}</span>
            </div>
        </div>
    )
}

export default BuildChaosSettings