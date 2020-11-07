import React from 'react'

function CardList(props) {
    const { cardList, cardData, updateCardOverlay } = props

    let assetCount = 0
    let eventCount = 0
    let skillCount = 0
    let otherCount = 0
    const hand = []
    const hand2 = []
    const arcane = []
    const arcane2 = []
    const accessory = []
    const body = []
    const ally = []
    const tarot = []
    const otherasset = []
    const permanent = []
    const event = []
    const skill = []
    const other = []

    cardList.forEach(item => {
        if (item.type_code === 'event') {
            event.push(item)
            eventCount += item.count
        }
        else if (item.type_code === 'skill') {
            skill.push(item)
            skillCount += item.count
        }
        else if (item.type_code === 'asset') {
            if (item.permanent) permanent.push(item)
            else if (item.slot === 'Hand') hand.push(item)
            else if (item.slot === 'Hand x2') hand2.push(item)
            else if (item.slot === 'Arcane') arcane.push(item)
            else if (item.slot === 'Arcane x2') arcane2.push(item)
            else if (item.slot === 'Accessory') accessory.push(item)
            else if (item.slot === 'Body') body.push(item)
            else if (item.slot === 'Ally') ally.push(item)
            else if (item.slot === 'Tarot') tarot.push(item)
            else otherasset.push(item)
            assetCount += item.count
        }
        else {
            other.push(item)
            otherCount += item.count
        }
    })

    function onEnterCard(event) {
        const cardArray = cardData.filter(item => item.code === event.target.id)

        if (cardArray && cardArray.length > 0) {
            const imagesrc = "http://www.arkhamdb.com" + cardArray[0].imagesrc

            updateCardOverlay(imagesrc, event.clientX)
        }
    }
/*
    function onEnterCardRight(event) {
        const cardArray = cardData.filter(item => item.code === event.target.id)

        if (cardArray && cardArray.length > 0) {
            const imagesrc = "http://www.arkhamdb.com" + cardArray[0].imagesrc

            updateCardOverlay(imagesrc, "Left")
        }
    }
*/
    function onLeaveCard(event) {
        updateCardOverlay(null, 0)
    }

    const assetHeader = assetCount > 0 ? <h4>Assets ({assetCount})</h4> : null
    
    const handHeader = hand.length > 0 ? <p className='slot-header'>Hand</p> : null
    const handContents = hand.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const hand2Header = hand2.length > 0 ? <p className='slot-header'>Hand x2</p> : null
    const hand2Contents = hand2.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const arcaneHeader = arcane.length > 0 ? <p className='slot-header'>Arcane</p> : null
    const arcaneContents = arcane.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const arcane2Header = arcane2.length > 0 ? <p className='slot-header'>Arcane x2</p> : null
    const arcane2Contents = arcane2.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const accessoryHeader = accessory.length > 0 ? <p className='slot-header'>Accessory</p> : null
    const accessoryContents = accessory.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const bodyHeader = body.length > 0 ? <p className='slot-header'>Body</p> : null
    const bodyContents = body.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const allyHeader = ally.length > 0 ? <p className='slot-header'>Ally</p> : null
    const allyContents = ally.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const tarotHeader = tarot.length > 0 ? <p className='slot-header'>Tarot</p> : null
    const tarotContents = tarot.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const otherassetHeader = otherasset.length > 0 ? <p className='slot-header'>Other</p> : null
    const otherassetContents = otherasset.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const permanentHeader = permanent.length > 0 ? <p className='slot-header'>Permanent</p> : null
    const permanentContents = permanent.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const eventHeader = eventCount > 0 ? <h4>Events ({eventCount})</h4> : null
    const eventContents = event.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const skillHeader = skillCount > 0 ? <h4>Skills ({skillCount})</h4> : null
    const skillContents = skill.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    const otherHeader = otherCount > 0 ? <h4>Other ({otherCount})</h4> : null
    const otherContents = other.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item, index) => {
        const countStr = item.count > 1 ? ' x' + item.count : null

        return <p id={item.key} onPointerEnter={onEnterCard} onPointerLeave={onLeaveCard} key={index}>{item.name}{countStr}</p>
    })

    return (
        <div className="settingsDiv">
            <h3 style={{marginBottom: "-10px"}}>Card List</h3>
            <div className="cardContainer">
                <div className="col1">
                    {assetHeader}
                    {handHeader}
                    {handContents}
                    {hand2Header}
                    {hand2Contents}
                    {arcaneHeader}
                    {arcaneContents}
                    {arcane2Header}
                    {arcane2Contents}
                    {accessoryHeader}
                    {accessoryContents}
                    {bodyHeader}
                    {bodyContents}
                    {allyHeader}
                    {allyContents}
                    {tarotHeader}
                    {tarotContents}
                    {otherassetHeader}
                    {otherassetContents}
                    {permanentHeader}
                    {permanentContents}
                </div>
                <div className="col2">
                    {eventHeader}
                    {eventContents}
                    {skillHeader}
                    {skillContents}
                    {otherHeader}
                    {otherContents}
                </div>
            </div>
        </div>
    )
}

export default CardList
