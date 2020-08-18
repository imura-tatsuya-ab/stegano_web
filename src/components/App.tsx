import * as React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Tabs, Tab } from '@material-ui/core'
import CreateIcon from '@material-ui/icons/Create'
import VisibilityIcon from '@material-ui/icons/Visibility'
import Encode from './Encode'
import Decode from './Decode'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
}))

const App: React.FC = () => {
  const [tab, setTab] = React.useState(0)
  const classes = useStyles()
  const handleTabs = (e: React.ChangeEvent<{}>, value: number) => {
    setTab(value)
  }
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="static">
        <Tabs value={tab} onChange={handleTabs}>
          <Tab icon={<CreateIcon />} label="Encode" />
          <Tab icon={<VisibilityIcon />} label="Decode" />
        </Tabs>
      </AppBar>
      {tab === 0 ? <Encode /> : <Decode />}
    </div>
  )
}

export default App
