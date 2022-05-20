import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import 'chart.js/auto';
import './PoolChart.css'
import { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
const axios = require('axios').default;


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
ChartJS.defaults.color = "#fff";
ChartJS.defaults.backgroundColor = "#fff";
ChartJS.defaults.borderColor = "#fff";

export default function PoolChart(props) {
  const [balanceRange, setBalanceRange] = useState([])
  const [rawData, setRawData] = useState([])
  const [range, setRange] = useState([10,90])
  const [votingOptions, setVotingOption] = useState(['Yes','No'])
  const [chartData, setChartData] = useState({options:null, data:null})
  const votingOptionColor = {
    'Yes':'white',
    'No':'red'
  }
  const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
  const invlerp = (x, y, a) => clamp((a - x) / (y - x));

  const handleChange = (event, newValue) => {
    setRange(newValue);
  };

  
  useEffect(()=>{
    axios.get("https://raw.githubusercontent.com/IncioMan/terra-rebirth/master/data/votes.json")
        .then(function (response) {
          console.log(response.data)
          setRawData(response.data)
          const balances = response.data.map((d)=>d.balance)
          const newRange = [Math.min(...balances), Math.max(...balances)]
          setBalanceRange(newRange)
          setRange(newRange)
        })
        .catch(function (error) {
            console.log(error);
        })
  },[])

  useEffect(()=>{
    if(rawData.length === 0){
      return
    }

    const filtData = rawData.filter((d)=>d.balance>0)
                            .filter((d)=>d.balance>=range[0])
                            .filter((d)=>d.balance<=range[1])
    const balances = filtData.map((d)=>d.balance)

    const data = {
      labels: votingOptions,
      datasets: votingOptions.map((l)=>{
        return {
          label: l,
          data: filtData.filter((d)=>d.option===l).map((d)=>
          {
            let datapoint = {}
            datapoint.x = d.hours_since_start
            datapoint.y = d.date
            datapoint.option = d.option
            datapoint.address = d.address
            datapoint.balance = d.balance
            datapoint.hours_since_start = d.hours_since_start
            datapoint.r = invlerp(Math.min(...balances), Math.max(...balances), d.balance)*10
            return datapoint
          }),
          fill: false,
          borderColor: '#fbc02c',
          tension: 0.1,
          backgroundColor: votingOptionColor[l]
        }
      })
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: false,
          text: 'Chart.js Line Chart',
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
                console.log(context)
                let label = context.dataset.label || '';
                let labelAddress=''
                let labelVote='' 
                let labelTime = ''
                if (context.raw) {
                    labelTime += 'Hours after beginning of voting: '+context.raw.hours_since_start
                    labelAddress += 'Address: '+context.raw.address
                    labelVote += 'Balance: '+ context.raw.balance + ' LUNA'
                }
                return [label, labelVote, labelAddress, labelTime];
              }
            }
        }
      },
      elements: {
        point:{
          borderWidth: 0,
          radius: 0
        }
      },
      scales: {
        x: {
          stacked: true,
          grid:{
            display: false
          },
          title: {
            display: false,
          }
        },
        y: {
          grid:{
            display: false
          },
          title: {
            display: true,
            text: 'Total gamma tokens since 1st of February 2022'
          }
        },
      },
    };
    
    const cd = {
      options: options,
      data: data
    }
    setChartData(cd)
  },[rawData, range])

    return (
      <>
      <div className='chart-container'>
      <div style={{ width: "80%", minWidth: "250px"}}>
        { (chartData.data)&&
          <>
          <div className='slider-container'>
            <Slider className="slider-range"
              getAriaLabel={() => 'Temperature range'}
              value={range}
              step={0.1}
              onChange={handleChange}
              valueLabelDisplay="auto"
              style={{width:'80%'}}
              min={balanceRange[0]}
              max={balanceRange[1]}
            />
          </div>
          <div className='slider-container'>
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">Vote</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="yes"
                name="radio-buttons-group"
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="abstain" control={<Radio />} label="Abstain" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel style={{marginRight:'0px'}} value="no_veto" control={<Radio />} label="No With Veto" />
              </RadioGroup>
            </FormControl>
          </div>
          <Bubble options={chartData.options} data={chartData.data} />
          </>
        }
      </div>
    </div>
    </>
)}