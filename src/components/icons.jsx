function Icon({ text, className = "", viewBox = "0 0 20 20", ...props }) {
  return (
    <div className={`flex flex-col flex-no-wrap ${className}`}>
      <svg className={`fill-current flex-shrink-0 ${text && 'h-2/3'}`} viewBox={viewBox} {...props} />
      {text && (
        <span className="self-center text-micro font-black whitespace-no-wrap h-1/3">
          {text}
        </span>
      )}
    </div>
  )

}

/**** from Entypo https://github.com/adamwathan/entypo-optimized/tree/master/dist/icons  ***/

export const Edit = (props) => (
  <Icon viewBox="0 0 576 512" {...props} >
    <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
  </Icon>
)

export const CircleWithCrossIcon = (props) => (
  <Icon {...props}>
    <path d="M10,1.6c-4.639,0-8.4,3.761-8.4,8.4c0,4.639,3.761,8.4,8.4,8.4s8.4-3.761,8.4-8.4C18.4,5.361,14.639,1.6,10,1.6z
    M14.789,13.061l-1.729,1.729L10,11.729l-3.061,3.06l-1.729-1.729L8.272,10L5.211,6.939L6.94,5.211L10,8.271l3.061-3.061
    l1.729,1.729L11.728,10L14.789,13.061z"/>
  </Icon>
)

export const HomeIcon = (props) => (
  <Icon {...props}>
    <path d="M18.672 11H17v6c0 .445-.194 1-1 1h-4v-6H8v6H4c-.806 0-1-.555-1-1v-6H1.328c-.598 0-.47-.324-.06-.748L9.292 2.22c.195-.202.451-.302.708-.312.257.01.513.109.708.312l8.023 8.031c.411.425.539.749-.059.749z" />
  </Icon>
)
