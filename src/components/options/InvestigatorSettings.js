import React from "react"

function InvestigatorSettings(props) {
    const { investigator, parallel, secondaryClass, selectedDeckSize, selectedTaboo, deckSize, cardData, tabooData } = props

    const investigatorData = [
        'Agnes Baker',
        'Agnes Baker (Parallel)',
        'Akachi Onyele',
        'Amanda Sharpe',
        '"Ashcan" Pete',
        'Bob Jenkins',
        'Calvin Wright',
        'Carolyn Fern',
        'Daisy Walker',
        'Daisy Walker (Parallel)',
        'Daniela Reyes',
        'Dexter Drake',
        'Diana Stanley',
        'Father Mateo',
        'Finn Edwards',
        'Gloria Goldberg',
        'Harvey Walters',
        'Jacqueline Fine',
        'Jenny Barnes',
        'Jim Culver',
        'Joe Diamond',
        'Leo Anderson',
        'Lily Chen',
        'Lola Hayes',
        'Luke Robinson',
        'Mandy Thompson',
        'Marie Lambeau',
        'Mark Harrigan',
        'Minh Thi Phan',
        'Monterey Jack',
        'Nathaniel Cho',
        'Norman Withers',
        'Patrice Hathaway',
        'Preston Fairmont',
        'Rex Murphy',
        'Rita Young',
        'Roland Banks',
        'Sefina Rousseau',
        'Silas Marsh',
        'Sister Mary',
        '"Skids" O\'Toole',
        '"Skids" O\'Toole (Parallel)',
        'Stella Clark',
        'Tommy Muldoon',
        'Tony Morgan',
        'Trish Scarborough',
        'Ursula Downs',
        'Wendy Adams',
        'William Yorick',
        'Winifred Habbamock',
        'Zoey Samaras'
    ]

    const investigatorFull = parallel ? investigator + ' (Parallel)' : investigator

    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    function changeInvestigator(value) {
        let re = /(.*)(\s\(Parallel\))/

        const match = value.match(re)

        if (match) {
            // parallel investigator
//            props.onChangeSetting('parallel', true)
//            props.onChangeSetting('investigator', match[1])
            props.onChangeInvestigator(match[1], true)
        }
        else {
//            props.onChangeSetting('parallel', false)
//            props.onChangeSetting('investigator', value)
            props.onChangeInvestigator(value, false)
        }
    }

    function handleChangeInvestigator(event) {
        changeInvestigator(event.target.value)
    }

    function handleRandom(event) {
        changeInvestigator(investigatorData[Math.floor(Math.random() * investigatorData.length)])
    }

    let secondaryFactionList = null
    let deckSizeList = null
    let tabooList = null
    let secondaryClassValue = secondaryClass
    let deckSizeValue = selectedDeckSize ? selectedDeckSize : deckSize

    if (cardData) {
        const investigatorID = Object.keys(cardData)
        .filter(key => {
            return cardData[key].name === investigator && (parallel ? typeof cardData[key].alternate_of_name !== 'undefined' : true)
        })[0]

        const deckOptions = cardData[investigatorID].deck_options

        for (let i = 0; i < deckOptions.length; i++) {
            if (deckOptions[i].name === 'Secondary Class')
            {
                const list = deckOptions[i].faction_select

                secondaryFactionList = list.map((item, index) => {
                    return <option value={item} key={index}>
                        {item[0].toUpperCase() + item.slice(1)}
                        </option>
                })
            }
            else if (deckOptions[i].name === 'Deck Size')
            {
                const list = deckOptions[i].deck_size_select

                deckSizeList = list.map((item, index) => {
                    return <option value={item} key={index}>
                        {item}
                        </option>
                })
            }
        }
    }

    if (tabooData) {
        tabooList = tabooData.map((item, index) => {
            return <option value={item.code} key={index}>
                {item.date_start}
                </option>
        })

        tabooList.unshift(<option value="None" key="100">
            {"None"}
            </option>)
    }

    const tabooDiv = <div>
        <label className="taboo" value={selectedTaboo}>Taboo list:</label>
        <span className="investigator-option">
            <select className="taboo investigatorList" name="taboo" value={selectedTaboo} onChange={handleChange}>
                {tabooList}
            </select>
        </span>
    </div>

//    let skidsName = '"Skids" '
//    skidsName = skidsName + "O'Toole"
//    const skidsOption = <option value={skidsName}>{skidsName}</option>

    const secondaryClassDiv = secondaryFactionList ?
        <div>
            <label value={secondaryClassValue}>Secondary class:</label>
            <span className="investigator-option">
                <select className="secondaryClass investigatorList" name="secondaryClass" value={secondaryClassValue} onChange={handleChange}>
                    {secondaryFactionList}
                </select>
            </span>
        </div>
        :
        null

    const deckSizeDiv = deckSizeList ?
        <div>
            <label value={deckSizeValue}>Deck size:</label>
            <span className="investigator-option">
                <select className="deckSize investigatorList" name="selectedDeckSize" value={deckSizeValue} onChange={handleChange}>
                    {deckSizeList}
                </select>
            </span>
        </div>
        :
        null

    return (
        <div className="settingsDiv">
            <h3>Investigator Options</h3>
            <label>Investigator:</label>
            <span className="investigator-option">
                <select name="investigator" value={investigatorFull} onChange={handleChangeInvestigator}>
                    {investigatorData.map( (name, index) => (
                        <option value={name} key={name}>{name}</option>
                    ))}
                </select>
                <button className="button-rect" id="button-random" onClick={handleRandom}>Random</button>
            </span>
            {secondaryClassDiv}
            {deckSizeDiv}
            {tabooDiv}
        </div>
    )
}

export default InvestigatorSettings