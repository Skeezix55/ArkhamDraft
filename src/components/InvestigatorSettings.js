import React from "react"

function InvestigatorSettings(props) {
    const { investigator, secondaryClass, selectedDeckSize, deckSize, cardData } = props

    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    let secondaryFactionList = null
    let deckSizeList = null
    let secondaryClassValue = secondaryClass
    let deckSizeValue = selectedDeckSize ? selectedDeckSize : deckSize

    if (cardData) {
        const investigatorID = Object.keys(cardData)
        .filter(key => {
            return  cardData[key].name === investigator
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

    let skidsName = '"Skids" '
    skidsName = skidsName + "O'Toole"
    const skidsOption = <option value={skidsName}>{skidsName}</option>

    const secondaryClassDiv = secondaryFactionList ?
        <div>
            <label className="secondaryClass" value={secondaryClassValue}>Secondary class:</label>
            <select className="secondaryClass" name="secondaryClass" value={secondaryClassValue} onChange={handleChange}>
                {secondaryFactionList}
            </select>
        </div>
        :
        null

        const deckSizeDiv = deckSizeList ?
        <div>
            <label className="deckSize" value={deckSizeValue}>Deck size:</label>
            <select className="deckSize" name="selectedDeckSize" value={deckSizeValue} onChange={handleChange}>
                {deckSizeList}
            </select>
        </div>
        :
        null

    return (
        <div className="settings">
            <h3>Investigator Options</h3>
            <label>Investigator:</label>
            <select name="investigator" value={investigator} onChange={handleChange}>
                <option value="Roland Banks">Roland Banks</option>
                <option value="Daisy Walker">Daisy Walker</option>
                {skidsOption}
                <option value="Agnes Baker">Agnes Baker</option>
                <option value="Wendy Adams">Wendy Adams</option>
                <option value="Zoey Samaras">Zoey Samaras</option>
                <option value="Rex Murphy">Rex Murphy</option>
                <option value="Jenny Barnes">Jenny Barnes</option>
                <option value="Jim Culver">Jim Culver</option>
                <option value='"Ashcan" Pete'>"Ashcan" Pete</option>
                <option value="Mark Harrigan">Mark Harrigan</option>
                <option value="Minh Thi Phan">Minh Thi Phan</option>
                <option value="Sefina Rousseau">Sefina Rousseau</option>
                <option value="Akachi Onyele">Akachi Onyele</option>
                <option value="William Yorick">William Yorick</option>
                <option value="Lola Hayes">Lola Hayes</option>
                <option value="Leo Anderson">Leo Anderson</option>
                <option value="Ursula Downs">Ursula Downs</option>
                <option value="Finn Edwards">Finn Edwards</option>
                <option value="Father Mateo">Father Mateo</option>
                <option value="Calvin Wright">Calvin Wright</option>
                <option value="Carolyn Fern">Carolyn Fern</option>
                <option value="Joe Diamond">Joe Diamond</option>
                <option value="Preston Fairmont">Preston Fairmont</option>
                <option value="Diana Stanley">Diana Stanley</option>
                <option value="Rita Young">Rita Young</option>
                <option value="Marie Lambeau">Marie Lambeau</option>
                <option value="Tommy Muldoon">Tommy Muldoon</option>
                <option value="Mandy Thompson">Mandy Thompson</option>
                <option value="Tony Morgan">Tony Morgan</option>
                <option value="Luke Robinson">Luke Robinson</option>
                <option value="Patrice Hathaway">Patrice Hathaway</option>
                <option value="Norman Withers">Norman Withers</option>
                <option value="Silas Marsh">Silas Marsh</option>
                <option value="Dexter Drake">Dexter Drake</option>
            </select>
            {secondaryClassDiv}
            {deckSizeDiv}
        </div>
    )
}

export default InvestigatorSettings