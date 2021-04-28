import PackData from '../components/PackData'

function ExportDeck(props) {
    const { fileType, deckTitle, investigator, cardList, specialCards, cardData } = props

    if (cardData === undefined || !cardData) return

    const asset = []
    const event = []
    const skill = []
    const treachery = []
    const enemy = []
    const other = []

    // we're getting card info from CardData now, not the items...
    const investigatorCard = cardData
    .filter(item => {
        return item.name === investigator
    })[0]

    cardList.concat(specialCards).forEach(listItem => {
        const card = cardData.filter(dataItem => {
            return listItem.key === dataItem.code
        })[0]

        let dataObject = {
            name: listItem.name,
            subname: card.subname,
            count: listItem.count,
            xp: card.xp,
            pack: card.pack_code,
            octgn_id: card.octgn_id
        }

        if (card.type_code === 'event') {
            event.push(dataObject)
        }
        else if (card.type_code === 'skill') {
            skill.push(dataObject)
        }
        else if (card.type_code === 'asset') {
            asset.push(dataObject)
        }
        else if (card.type_code === 'treachery') {
            treachery.push(dataObject)
        }
        else if (card.type_code === 'enemy') {
            enemy.push(dataObject)
        }
        else {
            other.push(dataObject)
        }
    })

    if (fileType === 'OCTGN') ExportO8D({
        deckTitle: (deckTitle.length > 0 ? deckTitle : 'Deck'),
        investigator: investigatorCard,
        assets: asset,
        events: event,
        skills: skill,
        treacheries: treachery,
        enemies: enemy,
        others: other
    })

    else ExportTXT({
        deckTitle: (deckTitle.length > 0 ? deckTitle : 'Deck'),
        investigator: investigatorCard,
        assets: asset,
        events: event,
        skills: skill,
        treacheries: treachery,
        enemies: enemy,
        others: other
    })
}

function ExportO8D(props) {
    var deckTextData = ['<?xml version="1.0" encoding="utf-8" standalone="yes"?>\r\n',
        '<deck game="a6d114c7-2e2a-4896-ad8c-0330605c90bf" sleeveid="0">\r\n',
        '  <section name="Investigator" shared="False">\r\n'
    ]
    
    const o8dids = props.investigator.octgn_id.split(':')

    o8dids.forEach( item => {
        deckTextData.push('    <card qty="1" id="' + item + '">' + props.investigator.name.replace(/["]/g, '&quot;') + '</card>\r\n')
    })

    deckTextData.push('  </section>\r\n')

    if (props.assets.length > 0) {
        deckTextData.push('  <section name="Asset" shared="False">\r\n')

        props.assets.forEach( item => {
            deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
        })    

        deckTextData.push('  </section>\r\n')
    }

    if (props.events.length > 0) {
        deckTextData.push('  <section name="Event" shared="False">\r\n')

        props.events.forEach( item => {
            deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
        })    

        deckTextData.push('  </section>\r\n')
    }

    if (props.skills.length > 0) {
        deckTextData.push('  <section name="Skill" shared="False">\r\n')

        props.skills.forEach( item => {
            deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
        })    

        deckTextData.push('  </section>\r\n')
    }

    if (props.treacheries.length > 0 || props.enemies.length > 0) {
        deckTextData.push('  <section name="Weakness" shared="False">\r\n')

        if (props.treacheries.length > 0) {
            props.treacheries.forEach( item => {
                deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
            })    
        }

        if (props.enemies.length > 0) {
            props.enemies.forEach( item => {
                deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
            })    
        }

        deckTextData.push('  </section>\r\n')
    }

    if (props.others.length > 0) {
        deckTextData.push('  <section name="Other" shared="False">\r\n')

        props.others.forEach( item => {
            deckTextData.push('    <card qty="' + item.count + '" id="' + item.octgn_id + '">' + item.name.replace(/["]/g, '&quot;') + '</card>\r\n')
        })    

        deckTextData.push('  </section>\r\n')
    }

    deckTextData.push('<notes><![CDATA[]]></notes>\r\n')
    deckTextData.push('</deck>\r\n')

    const element = document.createElement("a")
    const file = new Blob(deckTextData, {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = props.deckTitle.replace(/\s/g, '-') + ".o8d"
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
    document.body.removeChild(element)
}

function ExportTXT(props) {
    var deckTextData = []
    
    deckTextData.push(props.deckTitle + '\r\n\r\n')
    deckTextData.push(props.investigator.name + '\r\n\r\n')

    if (props.assets.length > 0) {
        deckTextData.push('Assets\r\n')

        props.assets.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }

    if (props.events.length > 0) {
        deckTextData.push('Events\r\n')

        props.events.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }

    if (props.skills.length > 0) {
        deckTextData.push('Skills\r\n')

        props.skills.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }

    if (props.treacheries.length > 0) {
        deckTextData.push('Treachery\r\n')

        props.treacheries.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }


    if (props.enemies.length > 0) {
        deckTextData.push('Enemy\r\n')

        props.enemies.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }

    if (props.others.length > 0) {
        deckTextData.push('Other\r\n')

        props.others.forEach( item => {
            const subtitle = (item.subname !== undefined) ? ':' + item.subname : ''
            const level = (item.xp !== undefined && item.xp > 0) ? ' [' + item.xp + '] ' : ' '

            deckTextData.push(item.count + 'x ' + item.name + subtitle + level + '(' + PackData[item.pack] + ')\r\n')
        })    

        deckTextData.push('\r\n')
    }

    const element = document.createElement("a")
    const file = new Blob(deckTextData, {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = props.deckTitle.replace(/\s/g, '-') + ".txt"
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
    document.body.removeChild(element)
}

export default ExportDeck