import React from 'react'
import CollectionCycle from './CollectionCycle'

function CollectionSettings(props) {
    const { expandCollection, collectionSets, onChangeSetting } = props


    function handleExpand(event) {
        props.onChangeSetting('expandCollection', !expandCollection)
    }

    // I'm lazy, just gonna hard code this... (also avoids incomplete ArkhamDB entries)
    if (expandCollection) {
        return (
            <div className="settingsDiv">
                <h3>Collection Options</h3>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['core', 'core2']}
                        columnValue='colcenter'
                        onChangeSetting={onChangeSetting}
                    />
                </div>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['dwl', 'tmm', 'tece', 'bota', 'uau', 'wda', 'litas']}
                        columnValue='col1'
                        onChangeSetting={onChangeSetting}
                    />
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['ptc', 'eotp', 'tuo', 'apot', 'tpm', 'bsr', 'dca']}
                        columnValue='col2'
                        onChangeSetting={onChangeSetting}
                    />
                </div>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['tfa', 'tof', 'tbb', 'hote', 'tcoa', 'tdoy', 'sha']}
                        columnValue='col1'
                        onChangeSetting={onChangeSetting}
                    />
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['tcu', 'tsn', 'wos', 'fgg', 'uad', 'icc', 'bbt']}
                        columnValue='col2'
                        onChangeSetting={onChangeSetting}
                    />
                </div>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['tde', 'sfk', 'tsh', 'dsm', 'pnr', 'wgd', 'woc']}
                        columnValue='col1'
                        onChangeSetting={onChangeSetting}
                    />
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['tic', 'itd', 'def', 'hhg', 'lif', 'lod', 'itm']}
                        columnValue='col2'
                        onChangeSetting={onChangeSetting}
                    />
                </div>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['eoep']}
                        columnValue='col1'
                        onChangeSetting={onChangeSetting}
                    />
                    <div className='col2'>
                    </div>
                </div>
                <div className="cardContainer">
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['nat', 'har', 'win', 'jac', 'ste']}
                        header='Starter Decks'
                        columnValue='col1'
                        onChangeSetting={onChangeSetting}
                    />
                    <CollectionCycle 
                        collectionSets={collectionSets}
                        includedSets={['rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu']}
                        header='Return to Boxes'
                        columnValue='col2'
                        onChangeSetting={onChangeSetting}
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
