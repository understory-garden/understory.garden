import React, { FunctionComponent } from 'react'

import { useEditor } from 'slate-react';

import {
  insertRow, insertColumn, removeRow, removeColumn,
} from '../../utils/editor';

import IconButton from '../IconButton';


const Table = ({ attributes, children, element }) => {
  const editor = useEditor()
  const classes = useStyles()
  const blockClasses = useBlockStyles()
  return (
    <>
      <Box display="flex">
        <table className={classes.table}>
          <tbody {...attributes}>{children}</tbody>
        </table>
        <Box className={`${classes.columnButtons} ${blockClasses.blockHoverButtons}`}
          contentEditable={false}>
          <IconButton title="add column" size="small"
            onClick={() => insertColumn(editor, element)}>
            <ArrowRight />
          </IconButton>
          <IconButton title="remove column" size="small"
            onClick={() => removeColumn(editor, element)}>
            <ArrowLeft />
          </IconButton>
        </Box>
      </Box>
      <Box className={`${classes.rowButtons} ${blockClasses.blockHoverButtons}`} contentEditable={false}>
        <IconButton title="add row" size="small"
          onClick={() => insertRow(editor, element)}>
          <ArrowDown />
        </IconButton>
        <IconButton title="remove row" size="small"
          onClick={() => removeRow(editor, element)}>
          <ArrowUp />
        </IconButton>
      </Box>
    </>
  )
}
export default Table
