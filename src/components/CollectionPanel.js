import React from 'react'
import { useSelector } from 'react-redux'

import CollectionCycle from './CollectionCycle'

function CollectionSettings(props) {
    const { expandCollection, doExpandCollection } = props

    const collectionSets = useSelector(state => state.collection)

    function handleExpand(event) {
        doExpandCollection(!expandCollection)
    }

    // I'm lazy, just gonna hard code this... (also avoids incomplete ArkhamDB entries)
    if (expandCollection) {
        return (
            <div className="settingsDiv">
                <h3>Collection Options</h3>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['core', 'core2']}
                        columnValue='colcenter'
                    />
                </div>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['dwl', 'tmm', 'tece', 'bota', 'uau', 'wda', 'litas']}
                        columnValue='col1'
                    />
                    <CollectionCycle 
                        includedSets={['ptc', 'eotp', 'tuo', 'apot', 'tpm', 'bsr', 'dca']}
                        columnValue='col2'
                    />
                </div>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['tfa', 'tof', 'tbb', 'hote', 'tcoa', 'tdoy', 'sha']}
                        columnValue='col1'
                    />
                    <CollectionCycle 
                        includedSets={['tcu', 'tsn', 'wos', 'fgg', 'uad', 'icc', 'bbt']}
                        columnValue='col2'
                    />
                </div>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['tde', 'sfk', 'tsh', 'dsm', 'pnr', 'wgd', 'woc']}
                        columnValue='col1'
                    />
                    <CollectionCycle 
                        includedSets={['tic', 'itd', 'def', 'hhg', 'lif', 'lod', 'itm']}
                        columnValue='col2'
                    />
                </div>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['eoep']}
                        columnValue='col1'
                    />
                    <div className='col2'>
                    </div>
                </div>
                <div className="card-container">
                    <CollectionCycle 
                        includedSets={['nat', 'har', 'win', 'jac', 'ste']}
                        header='Starter Decks'
                        columnValue='col1'
                    />
                    <CollectionCycle 
                        includedSets={['rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu']}
                        header='Return to Boxes'
                        columnValue='col2'
                    />
                </div>

                <button className="button-rect button-green" onClick={handleExpand}>Collapse</button>
            </div>
        )
    }
    else {
        var coreCount = collectionSets['core'] + collectionSets['core2']
        var packCount = 0
        for (var code in collectionSets) {
            if (collectionSets[code] === 1) packCount++
        }
        packCount -= coreCount

        return (
            <div className="settingsDiv">
                <h3>Collection Options</h3>
                <p>{coreCount} core set{coreCount === 1 ? null : 's'}, {packCount} pack{packCount === 1 ? null : 's'} selected</p>
                <button className="button-rect button-green" onClick={handleExpand}>Expand</button>
            </div>
        )
    }
}

export default CollectionSettings
