import React from 'react'
import PackData from '../../components/PackData'

function CollectionCycle(props) {
    const { collectionSets, includedSets, columnValue } = props

    function handleChange(event) {
        if (event.target.name === 'core' && !event.target.checked) props.onChangeSetting('collectionSetOff', includedSets)
        else if (event.target.name === 'core2' && event.target.checked) props.onChangeSetting('collectionSetOn', includedSets)
        else if (event.target.checked) props.onChangeSetting('collectionSetOn', [event.target.name])
        else props.onChangeSetting('collectionSetOff', [event.target.name])

//        if (event.target.name === 'core') {
//            if (!event.target.checked) props.onChangeSetting('collectionSetOff', ['core2'])
//        }
    }

    function handleSelect(event) {
        props.onChangeSetting('collectionSetOn', includedSets)
    }

    function handleDeselect(event) {
        props.onChangeSetting('collectionSetOff', includedSets)
    }

    const checkboxes = includedSets.map( code => {
        return (
            <div className="pack-option" key={code}>
                <input type="checkbox" checked={collectionSets[code]} name={code} className="set-checkbox" onChange={handleChange}/>
                <label className="set-label">{PackData[code]}</label>
            </div>
        )
    })

    return (
        <div className={'cardSet ' + columnValue}>
            <h4 className="set-header">{props.header ? props.header : PackData[includedSets[0]]}</h4>

            {checkboxes}

            <div style={{position: "absolute", right: "0", top: "0", width: "40%"}}>
                <button className="button-deselectset" value="deselect" title="Deselect all" onClick={() => handleDeselect()}/>
                <button className="button-selectset" value="select" title="Select all" onClick={() => handleSelect()}/>
            </div>
        </div>
    )
}

export default CollectionCycle
