import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { changeCollection } from '../features/collection/collectionSlice'

import PackData from '../data/PackData'

function CollectionCycle(props) {
    const { includedSets, columnValue, header } = props

    const collectionSets = useSelector(state => state.collection)
    const dispatch = useDispatch()

    function handleChange(event) {
        if (event.target.name === 'core' && !event.target.checked) dispatch(changeCollection('Off', includedSets))
        else if (event.target.name === 'core2' && event.target.checked) dispatch(changeCollection('On', includedSets))
        else if (event.target.checked) dispatch(changeCollection('On', [event.target.name]))
        else dispatch(changeCollection('Off', [event.target.name]))
    }

    function handleSelect(event) {
        dispatch(changeCollection('On', includedSets))
    }

    function handleDeselect(event) {
        dispatch(changeCollection('Off', includedSets))
    }

    const checkboxes = includedSets.map( code => {
        return (
            <div className="pack-option" key={code}>
                <input type="checkbox" className="set-checkbox" checked={collectionSets[code]} name={code} onChange={handleChange}/>
                <label>{PackData[code]}</label>
            </div>
        )
    })

    return (
        <div className={'cardSet ' + columnValue}>
            <h4 className="set-header">{header ? header : PackData[includedSets[0]]}</h4>

            {checkboxes}

            <div className="setbutton-div">
                <button className="button-deselectset" value="deselect" title="Deselect all" onClick={() => handleDeselect()}/>
                <button className="button-selectset" value="select" title="Select all" onClick={() => handleSelect()}/>
            </div>
        </div>
    )
}

export default CollectionCycle
