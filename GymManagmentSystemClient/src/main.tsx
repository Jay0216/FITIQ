import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import QRCodeScan from './pages/QRCodeScan.tsx'
import MemberDashboard from './pages/MemberDashboard.tsx'
import MemberAuth from './pages/MemberAuth.tsx'
import TrainerDashboard from './pages/TrainerDashboard.tsx'
import OwnerDashboard from './pages/OwnerDashboard.tsx'
import TrainerAuth from './pages/TrainerAuth.tsx'
import OwnerAuth from './pages/OwnerAuth.tsx'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'

const routes = createBrowserRouter([


  {

    path: "/",
    element: <App />
  },


  {
    path: "/qrscan",
    element: <QRCodeScan/>
  },

  {
    path: "/memberdashboard",
    element: <MemberDashboard/>
  },

  {
    path: "/memberauth",
    element: <MemberAuth/>
  },

  {
    path: "/trainerdashboard",
    element: <TrainerDashboard/>
  },

  {
    path: "/ownerdashboard",
    element: <OwnerDashboard/>
  },

  {
    path: "/trainerauth",
    element: <TrainerAuth/>
  },

  {
    path: "/ownerauth",
    element: <OwnerAuth/>
  }

  
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
     <RouterProvider router={routes} />
    </Provider>
    
  </StrictMode>,
)
