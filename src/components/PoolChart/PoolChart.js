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
  const [inputAddress, setInputAddress] = useState()
  const [votingValue, setVotingValue] = useState('All')
  const [rawData, setRawData] = useState([])
  const [range, setRange] = useState([10,90])
  const [votingOptions, setVotingOptions] = useState(['Yes','No','Abstain','No with veto'])
  const [chartData, setChartData] = useState({options:null, data:null})
  const votingOptionColor = {
    'Yes':'limegreen',
    'No':'#F55353',
    'No with veto':'#B20600',
    'Abstain':'white'
  }
  const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
  const invlerp = (x, y, a) => clamp((a - x) / (y - x));

  const handleChange = (event, newValue) => {
    setRange(newValue);
  };

  const handleVoteOption = (event) => {
    console.log(event.target.value)
    setVotingValue(event.target.value)
    if(event.target.value === 'All'){
      setVotingOptions(['Yes','No','Abstain','No with veto']);
    }else{
      setVotingOptions([event.target.value]);
    }
  };

  const handleTextInput = (e)=>{
    setInputAddress(e.target.value)
  }

  useEffect(()=>{
    if(inputAddress && inputAddress !== ''){
      setVotingOptions(['Yes','No','Abstain','No with veto']);
      setVotingValue('No');
    }
  },[inputAddress])

  
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

    let filtData = rawData.filter((d)=>votingOptions.includes(d.option))
                            .filter((d)=>d.balance>0)
                            .filter((d)=>d.balance>=range[0])
                            .filter((d)=>d.balance<=range[1])
    if(inputAddress && inputAddress !== ''){
      filtData = filtData.filter((d)=>d.address===inputAddress)
    }

    const data = {
      labels: votingOptions,
      datasets: votingOptions.map((l)=>{
        return {
          label: l,
          data: filtData.filter((d)=>d.option===l).map((d)=>
          {
            let datapoint = {}
            datapoint.x = (1000 - 2000*Math.random()) + d.balance
            datapoint.y = (100000000 - 200000000*Math.random()) + d.date
            datapoint.option = d.option
            datapoint.address = d.address
            datapoint.balance = d.balance
            datapoint.age = d.age
            datapoint.validator = d.validator
            datapoint.hours_since_start = d.hours_since_start
            datapoint.r = (d.age/365)*5+2
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
                let labelAge = ''
                let labelValidator = ''
                if (context.raw) {
                    labelTime += 'Hours after beginning of voting: '+context.raw.hours_since_start
                    labelAddress += 'Address: '+context.raw.address
                    labelAge += 'Wallet Age: '+context.raw.age
                    labelValidator += 'Validator: '+context.raw.validator
                    labelVote += 'Balance: '+ context.raw.balance + ' LUNA'
                }
                return [label, labelVote, labelAddress, labelAge, labelTime, labelValidator];
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
            display: true,
            text: 'LUNA balance'
          }
        },
        y: {
          display: false,
          grid:{
            display: false
          },
          title: {
            display: true,
            text: 'Placeholder for date creation'
          }
        },
      },
    };
    
    const cd = {
      options: options,
      data: data
    }
    setChartData(cd)
  },[rawData, range, votingOptions, inputAddress])

    return (
      <>
      <div className='chart-container'>
      <div className='inner-chart-container'>
        { (chartData.data)&&
          <>
          <div className='slider-container'>
            <input 
                className='addr-input' 
                value={inputAddress}
                type="text" 
                id="fname" 
                name="ciao"
                autoFocus={true}
                onChange={handleTextInput}
                placeholder={"Input the voter's address"}/>
          </div>
          <div className='slider-container'>
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue={'All'}
                value={votingValue}
                name="radio-buttons-group"
                onChange= {handleVoteOption}
              >
                <FormControlLabel value="All" control={<Radio />} label="All" />
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="Abstain" control={<Radio />} label="Abstain" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel style={{marginRight:'0px'}} value="No with veto" control={<Radio />} label="No With Veto" />
              </RadioGroup>
            </FormControl>
          </div>
          <div className='slider-container'>
            <div className='slider-text-container'>
              <div className='slider-text'>
                  {Math.round(range[0]/1000,2)}k-{Math.round(range[1]/1000,2)}k LUNA
              </div>
            </div>
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
          <Bubble options={chartData.options} data={chartData.data} />
          </>
        }
      </div>
    </div>
    </>
)}