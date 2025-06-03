export default function CustomSelect(props) {
    return (
        <select 
        onChange={props.onChange}
        value={props.value}
        name={props.name} {...props}>
            {Object.keys(props.values).map(item => (
                <option value={props.values[item].value || item}>
                    {props.values[item].label}
                </option>
            ))}
        </select>
    )
}