export default function TabButton({name, activeName, setTab, ...rest}){
  return (
    <button className={`tab-btn ${(name === activeName) && 'active'}`}
            onClick={() => setTab(name)}
            {...rest} />
  )
}
