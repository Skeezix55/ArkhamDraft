import React from "react"

function InvestigatorSettings(props) {
    function handleChange(event) {
        props.onChangeSetting(event.target.name, event.target.value)
    }

    let skidsName = '"Skids" '
    skidsName = skidsName + "O'Toole"
    const skidsOption = <option value={skidsName}>{skidsName}</option>

    return (
        <div className="settings">
            <h3>Investigator Options</h3>
            <label>Investigator:</label>
            <select name="investigator" value={props.investigator} onChange={handleChange}>
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
                <option value="William Yorick">William Yorick</option>
                <option value="Leo Anderson">Leo Anderson</option>
                <option value="Ursula Downs">Ursula Downs</option>
                <option value="Finn Edwards">Finn Edwards</option>
                <option value="Father Mateo">Father Mateo</option>
                <option value="Calvin Wright">Calvin Wright</option>
                <option value="Preston Fairmont">Preston Fairmont</option>
                <option value="Diana Stanley">Diana Stanley</option>
                <option value="Rita Young">Rita Young</option>
                <option value="Marie Lambeau">Marie Lambeau</option>
                <option value="Tommy Muldoon">Tommy Muldoon</option>
                <option value="Luke Robinson">Luke Robinson</option>
                <option value="Patrice Hathaway">Patrice Hathaway</option>
            </select>
            <br style={{display: "none"}}/>
            <label style={{display: "none"}} className="secondaryClass" value={props.secondaryClass}>Secondary class:</label>
            <select style={{display: "none"}} className="secondaryClass" name="secondaryClass" value={props.secondaryClass} onChange={handleChange}>
                <option value="guardian">Guardian</option>
                <option value="seeker">Seeker</option>
                <option value="rogue">Rogue</option>
                <option value="mystic">Mystic</option>
                <option value="survivor">Survivor</option>
            </select>
            <br style={{display: "none"}}/>
            <label style={{display: "none"}} className="deckSize" value={props.deckSize}>Deck size:</label>
            <select style={{display: "none"}} className="deckSize" name="deckSize" value={props.deckSize} onChange={handleChange}>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
            </select>
        </div>
    )
}

export default InvestigatorSettings