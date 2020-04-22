import React, { useEffect, useState, useRef } from 'react';
import Images from '../../Assets/Images'
import moment from 'moment'
import exportFunctions from './action'
import {INNER_WIDTH, NUM_OF_ZOOM, WIDTH_CANVAS, HEIGHT_CHART, SECOND_PER_DAY, MAX_WIDTH_OF_CANVAS, CREATE_DATA} from '../../Utils/globalConstance'
import './style.scss'

function Weather() {
  const [initialData, setInitialData] = useState()
  const [widthOfWeb, setWidthOfWeb] = useState(INNER_WIDTH)
  const [widthOfCanvas, setWidthOfCanvas] = useState(WIDTH_CANVAS)
  const [rangeDay, setRangeDay] = useState({abc: 1})
  const [sunShowed, setSunShowed] = useState(false)
  const [rangeNight, setRangeNight] = useState({})
  const [moonShowed, setMoonShowed] = useState(false)
  const [time, setTime] = useState()
  const [allPointTide, setAllPointTide] = useState()
  const [positionOfSun, setPositionOfSun] = useState()
  const canvasRef = useRef(null)
  const getStartOfDay = (day) => {
    return Math.floor(day / SECOND_PER_DAY) * SECOND_PER_DAY
  }
  const getTimeMiddleChart = (startOfDay, e = undefined) => {
    return Math.floor(startOfDay + SECOND_PER_DAY / 4 + (e && e.target ? (e.target.scrollLeft / widthOfWeb / NUM_OF_ZOOM * SECOND_PER_DAY) : 0))
  }
  const getAllPointTide = () => {
    let data = []
    initialData.map((e) => {
      data = [...data, ...e.data]
    })
    return data
  }
  const canvasForTooltip = (ctx, i, x1, y1) => {
    const roundRect = (x, y, w, h, r) => {
      if (w < 2 * r) r = w / 2
      if (h < 2 * r) r = h / 2
      ctx.beginPath()
      ctx.moveTo(x+r, y)
      ctx.arcTo(x+w, y,   x+w, y+h, r)
      ctx.arcTo(x+w, y+h, x,   y+h, r)
      ctx.arcTo(x,   y+h, x,   y,   r)
      ctx.arcTo(x,   y,   x+w, y,   r)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.fill()
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0)'
    roundRect(x1 - 30, y1 - 18, 60, 36, 6)
  
    ctx.fillStyle = '#0068cc'
    ctx.font = '18px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillText(allPointTide[i].amountOfWater, x1, y1)
    ctx.font = '12px Segoe UI'
    ctx.fillText(moment(allPointTide[i].time * 1000).utc().format('hh:mm a'), x1, y1 + 13)
  }
  const canvasForTimeOfSun = () => {
    let startOfDay = allPointTide && getStartOfDay(allPointTide[0].time)
    const ctx = canvasRef && canvasRef.current && canvasRef.current.getContext('2d')
    ctx.beginPath()
    for(let i = 0; i < rangeDay.length; i++) {
      let x = (rangeDay[i].timmeStampSunrise - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      let x1 = (rangeDay[i].timmeStampSunset - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      ctx.fillStyle = '#f98a00'
      ctx.font = '14px Segoe UI'
      ctx.textAlign = 'center'
      ctx.fillText(moment(rangeDay[i].timmeStampSunrise * 1000).utc().format('hh:mm a'), x, HEIGHT_CHART + 15)
      ctx.fillText(moment(rangeDay[i].timmeStampSunset * 1000).utc().format('hh:mm a'), x1, HEIGHT_CHART + 15)
    }
  }
  const canvasForSun = (e = undefined, index = 0) => {
    let startOfDay = getStartOfDay(allPointTide[0].time)
    const ctx = canvasRef.current && canvasRef.current.getContext('2d')
    ctx.beginPath()
    let arrRangeDay = []
    for (let i = 0; i < initialData.length; i++) {
      let bezierCurve = (initialData[0].sunrise - startOfDay) / SECOND_PER_DAY * widthOfCanvas / NUM_OF_ZOOM
      let sunrise = (initialData[i].sunrise - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      let sunset = (initialData[i].sunset - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      arrRangeDay = [...arrRangeDay, 
        {sunrise, sunset, timmeStampSunrise: initialData[i].sunrise, timmeStampSunset: initialData[i].sunset}
      ]
      ctx.moveTo(sunrise, HEIGHT_CHART)
      ctx.bezierCurveTo(sunrise + bezierCurve, HEIGHT_CHART / 3, sunset - bezierCurve, HEIGHT_CHART / 3, sunset, HEIGHT_CHART)
    }
    let bezierCurve = (initialData[index].sunrise - startOfDay) / SECOND_PER_DAY * widthOfCanvas / NUM_OF_ZOOM
    let sunrise = (initialData[index].sunrise - startOfDay) / SECOND_PER_DAY * widthOfCanvas
    let sunset = (initialData[index].sunset - startOfDay) / SECOND_PER_DAY * widthOfCanvas
    let widthOfSunShow = sunset - sunrise
    let rateOfWidthSunShow = e ? ((e.target.scrollLeft + (widthOfWeb / 2) - sunrise) / widthOfSunShow) : 0
    let topPositionOfSun = exportFunctions.getBezierXY(rateOfWidthSunShow, sunrise, HEIGHT_CHART, sunrise + bezierCurve, HEIGHT_CHART / 3, sunset - bezierCurve, HEIGHT_CHART / 3, sunset, HEIGHT_CHART)
    ctx.strokeStyle = '#f98a00'
    ctx.stroke()
    setPositionOfSun(topPositionOfSun)
    setRangeDay(arrRangeDay)
  }
  const canvasForNight = (ctx, startOfDay) => {
    ctx.beginPath()
    let arrMoon = []
    for (let i = 0; i < initialData.length; i++) {
      let startNight = (initialData[i].startNight - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      let startDay = (initialData[i].startDay - startOfDay) / SECOND_PER_DAY * widthOfCanvas
      let endOfDay = (initialData[i].startDay - startOfDay + SECOND_PER_DAY - 1) / SECOND_PER_DAY * widthOfCanvas 
      if (i === 0) {
        ctx.moveTo(0, HEIGHT_CHART)
        ctx.lineTo(0, 0)
        ctx.lineTo(startDay, 0)
        ctx.lineTo(startDay, HEIGHT_CHART)

        ctx.moveTo(startNight, HEIGHT_CHART)
        ctx.lineTo(startNight, 0)
        ctx.lineTo(endOfDay, 0)
        ctx.lineTo(endOfDay, HEIGHT_CHART)
        arrMoon = [...arrMoon, {startNight: 0, startDay}, {startNight, startDay: endOfDay}]
      } else {
        ctx.moveTo(startNight, HEIGHT_CHART)
        ctx.lineTo(startNight, 0)
        ctx.lineTo(endOfDay, 0)
        ctx.lineTo(endOfDay, HEIGHT_CHART)
        arrMoon = [...arrMoon, {startNight, startDay: endOfDay}]
      }
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fill()
    setRangeNight(arrMoon)
  }
  const canvasForBottom = (ctx) => {
    ctx.beginPath()
    ctx.moveTo(0, HEIGHT_CHART)
    ctx.lineTo(0, HEIGHT_CHART + 30)
    ctx.lineTo(initialData.length * widthOfCanvas, HEIGHT_CHART + 30)
    ctx.lineTo(initialData.length * widthOfCanvas, HEIGHT_CHART)
    ctx.strokeStyle = '#d4d4d4'
    ctx.stroke()
    ctx.fillStyle = '#d4d4d4'
    ctx.fill()
  }
  const canvasForChart = () => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d')
    if (ctx) {
      let startOfDay = getStartOfDay(allPointTide[0].time)
      let getMaxPoint = Math.max(...allPointTide.map(e => e.point))
      let ratioHeightChart = HEIGHT_CHART * 0.5
      ctx.beginPath()
      ctx.moveTo(0, HEIGHT_CHART)
      ctx.lineTo(0, HEIGHT_CHART - allPointTide[0].point / getMaxPoint * ratioHeightChart)
      for (let i = 1; i < allPointTide.length - 2; i++) {
        let x1 = (allPointTide[i].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas
        let x2 = (allPointTide[i + 1].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas
        let xc = (x1 + x2) / 2
        let y1 = HEIGHT_CHART - allPointTide[i].point / getMaxPoint * ratioHeightChart
        let y2 = HEIGHT_CHART - allPointTide[i + 1].point / getMaxPoint * ratioHeightChart
        let yc = (y1 + y2) / 2
        ctx.quadraticCurveTo(x1, y1, xc, yc)
      }
      ctx.quadraticCurveTo(
        (allPointTide[allPointTide.length - 2].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas, 
        HEIGHT_CHART - allPointTide[allPointTide.length - 2].point / getMaxPoint * ratioHeightChart, 
        (allPointTide[allPointTide.length - 1].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas,
        HEIGHT_CHART - allPointTide[allPointTide.length - 1].point / getMaxPoint * ratioHeightChart
      )
      ctx.lineTo((allPointTide[allPointTide.length - 1].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas, HEIGHT_CHART)
      ctx.strokeStyle = '#6dd7ff'
      ctx.stroke()
      ctx.fillStyle = '#80dcff'
      ctx.fill()
      for (let i = 1; i < allPointTide.length - 2; i++) {
        let x1 = (allPointTide[i].time - startOfDay) / SECOND_PER_DAY * widthOfCanvas
        let y1 = HEIGHT_CHART - allPointTide[i].point / getMaxPoint * ratioHeightChart
        canvasForTooltip(ctx, i, x1, y1)
      }
      canvasForSun()
      canvasForNight(ctx, startOfDay)
      canvasForBottom(ctx)
    }
  }
  const handleScrollChart = (e) => {
    let startOfDay = initialData && getStartOfDay(initialData[0].data[0].time)
    let timeMiddleChart = getTimeMiddleChart(startOfDay, e)
    setTime(timeMiddleChart)
    let positionMiddleChart = e.target && e.target.scrollLeft + widthOfWeb / 2
    for (let i=0; i < rangeDay.length; i++) {
      if (rangeDay[i].sunrise <= positionMiddleChart && positionMiddleChart <= rangeDay[i].sunset) {
        setSunShowed(true)
        canvasForSun(e, i)
        return
      } else {
        setSunShowed(false)
      }
    }
    for (let i=0; i < rangeNight.length; i++) {
      if (rangeNight[i].startNight <= positionMiddleChart && positionMiddleChart <= rangeNight[i].startDay) {
        setMoonShowed(true)
        return
      } else {
        setMoonShowed(false)
      }
    }
  }
  const handleResize = () => {
    setWidthOfWeb(window.innerWidth > MAX_WIDTH_OF_CANVAS ? MAX_WIDTH_OF_CANVAS : window.innerWidth)
    setWidthOfCanvas((window.innerWidth > MAX_WIDTH_OF_CANVAS ? MAX_WIDTH_OF_CANVAS : window.innerWidth) * NUM_OF_ZOOM)
    canvasForChart()
  }
  const handleDay = () => {
    let day = moment(time * 1000).utc().format('D')
    let supAndDay = moment(time * 1000).utc().format('Do')
    let sup = supAndDay.replace(/[0-9]/g, '')
    let Month = moment(time * 1000).utc().format('MMMM')
    return (
      <span>
        {day}<sup>{sup}</sup> {Month}
      </span>
    )
  }
  useEffect(() => {
    if (rangeDay && allPointTide) {
      canvasForTimeOfSun()
    }
  }, [rangeDay])
  useEffect(() => {
    if (allPointTide) {
      canvasForChart()
    }
  }, [allPointTide])
  useEffect(() => {
    if (initialData) {
      setTime(getTimeMiddleChart(getStartOfDay(initialData[0].data[0].time)))
      setAllPointTide(getAllPointTide())
    }
  }, [initialData])
  useEffect(() => {
    setInitialData(CREATE_DATA)
    setWidthOfWeb(window.innerWidth > MAX_WIDTH_OF_CANVAS ? MAX_WIDTH_OF_CANVAS : window.innerWidth)
    setWidthOfCanvas((window.innerWidth > MAX_WIDTH_OF_CANVAS ? MAX_WIDTH_OF_CANVAS : window.innerWidth) * NUM_OF_ZOOM)
  }, [])
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })
  return (
    <div className='ContainerWeather'>
      <div className='cw-Header'>
        <div className='cw-ContentHeader'>
          <div className='cw-wrapTitle'>
            <img className='cw-menu' src={Images.openMenu}/>
            <div className='cw-title'>
              <div className='cw-name'>MyENV</div>
              <div className='cw-location'>
                <span>Current Location</span>
                <img className='cw-imgDown' src={Images.dropDownsvg}/>
              </div>
            </div>
            <img className='cw-bell' src={Images.bell}/>
          </div>
          <div className='cw-Detail'>
            <img className='cw-imgCloud' src={Images.cloud}/>
            <div className='cw-DetailContent'>
              <div className='cwd-name'>Cloudy</div>
              <div className='cwd-heatAndHumidity'>
                <div className='cwd-heat'>
                  <img className='cw-imgHeat' src={Images.thermometer}/>
                  <span>29°C</span>
                </div>
                <div className='cwd-humidity'>
                  <img className='cw-imgHumidity' src={Images.humidity}/>
                  <span>27%</span>
                </div>
              </div>
            </div>
          </div>
          <div className='cw-Add'>
            <div className='cw-PSI'>
              <div className='cwP-name'>PSI</div>
              <div className='cwP-number'>23</div>
              <div className='cwP-status'>Good</div>
            </div>
            <div className='cw-Rain'>
              <div className='cwR-name'>RAIN</div>
              <div className='cwR-number'>0</div>
              <div className='cwR-status'>mm</div>
            </div>
            <div className='cw-Dengue'>
              <div className='cwD-name'>DENGUE</div>
              <div className='cwD-circle'></div>
            </div>
            <div className='cw-AddTab'>
              <img className='cwA-imgAdd' src={Images.add}/>
              <div className='cwA-name'>Add</div>
            </div>
          </div>
        </div>
      </div>
      <div className='cw-WrapCanvas' style={{maxWidth: `${MAX_WIDTH_OF_CANVAS}px`}}>
        <div onScroll={(e) => handleScrollChart(e)} className='cw-Canvas' style={{width: `${widthOfCanvas}px`}}>
          <canvas ref={canvasRef} width={initialData && initialData.length * widthOfCanvas} height={HEIGHT_CHART + 30}/>
        </div>
        {sunShowed && <img className='cw-imgSun' src={Images.sunny} style={{top: `${positionOfSun.y}px`}}/>}
        {moonShowed && <img className='cw-imgMoon' src={Images.moon}/>}
        <div className='cw-TideAndSun'>
          <span className='cw-Tide'>Tide</span>
          <span className='cw-Dot'> • </span>
          <span className='cw-Sun'>Sunrise & Sunset</span>
        </div>
        <div className='cw-day'>{handleDay()}</div>
        <div className='cw-measure'></div>
        <div className='cw-time'>{moment(time * 1000).utc().format('hh:mm a')}</div>
      </div>
    </div>
  );
}

export default Weather
