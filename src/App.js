import { useEffect, useState } from "react";
import * as d3 from "d3";
import getBikers from "./get_bikers";
import "./App.css";

const margin = {
  top: 100,
  right: 20,
  bottom: 30,
  left: 60,
};

const dotRadius = 6;
const svgWidth = 900;
const svgHeight = 600;

const App = () => {
  const [bikers, setBikers] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedBiker, setSelectedBiker] = useState(null);
  const [{ xScale, yScale, colorScale }, setScales] = useState({});
  const [{ xPos, yPos }, setPos] = useState({});

  const transformTimeToDate = (time) =>
    new Date(1970, 0, 1, 0, ...time.split(":"));

  const initD3 = (bikers) => {
    const xScl = d3
      .scaleLinear()
      .range([0, svgWidth - margin.left - margin.right]);
    const yScl = d3
      .scaleTime()
      .range([svgHeight - margin.top - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const timeFmt = d3.timeFormat("%M:%S");

    const xAxs = d3.axisBottom(xScl).tickFormat(d3.format("d"));
    const yAxs = d3.axisLeft(yScl).tickFormat(timeFmt);

    xScl.domain([
      d3.min(bikers, (d) => d.Year - 1),
      d3.max(bikers, (d) => d.Year + 1),
    ]);

    const [yMin, yMax] = d3.extent(bikers, (d) => d.Time);
    yScl.domain([yMax, yMin]);

    setScales({ xScale: xScl, yScale: yScl, colorScale: color });

    const svg = d3.select("svg");
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr(
        "transform",
        `translate(0,${svgHeight - margin.top - margin.bottom})`
      )
      .call(xAxs)
      .append("text")
      .attr("x", svgWidth - margin.left)
      .attr("y", -6)
      .style("fill", "none")
      .style("stroke", "#282c34")
      .style("text-anchor", "end")
      .text("Year");

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.right + 16.5},0)`)
      .call(yAxs)
      .append("text")
      .attr("dy", "0.71em")
      .style("fill", "none")
      .style("stroke", "#282c34")
      .style("text-anchor", "start")
      .text("Best Time (minutes)")
      .attr("transform", `translate(-${margin.right},60)`)
      .style("border", "1px solid red");
  };

  useEffect(() => {
    getBikers()
      .then((bkrs) => {
        setBikers(
          bkrs.map((biker) => ({
            ...biker,
            Time: transformTimeToDate(biker.Time),
            Year: Number(biker.Year),
          }))
        );
      })
      .catch((err) => {
        console.error({ err });
        setHasError(true);
      });
  }, []);

  useEffect(() => {
    if (bikers.length > 0) {
      initD3(bikers);
    }
  }, [bikers]);

  useEffect(() => {
    if (xScale != null && yScale != null && colorScale != null) {
      setHasLoaded(true);
    }
  }, [xScale, yScale, colorScale]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React D3 – Dopers Amongst Bikers Scatterplot</h1>
        <h5>35 Fastest times up Alpe d'Huez</h5>
      </header>
      {hasError && (
        <h3>Something bad happened and I could not get the biker data</h3>
      )}
      {!hasError && (bikers.length === 0 || !hasLoaded) && (
        <h4>Fetching data...</h4>
      )}
      <div
        className={`tooltip${selectedBiker != null ? " tooltip-open" : ""}`}
        style={{ left: xPos, top: yPos }}
      >
        {selectedBiker != null && (
          <>
            <small className="tooltip-line">
              {selectedBiker.Name}: {selectedBiker.Nationality}
            </small>
            <small className="tooltip-line">
              Year: {selectedBiker.Year}, Time:{" "}
              {d3.timeFormat("%M:%S")(selectedBiker.Time)}
            </small>
            {selectedBiker.Doping !== "" && (
              <>
                <br />
                <small>{selectedBiker.Doping}</small>
              </>
            )}
          </>
        )}
      </div>
      {hasLoaded && !hasError && (
        <div id="legend">
          <div className="doping">Bikers with doping allegations</div>
          <br />
          <div className="no-doping">No doping allegations</div>
        </div>
      )}
      <svg
        width={svgWidth}
        height={svgHeight}
        transform={`translate(${margin.left},${margin.top})`}
      >
        {hasLoaded &&
          !hasError &&
          bikers.map((biker, i) => (
            <circle
              key={`${biker.Time.toISOString()}-${biker.Year}-${i}`}
              r={dotRadius}
              cx={xScale(biker.Year)}
              cy={yScale(biker.Time)}
              data-xvalue={biker.Year}
              data-yvalue={biker.Time.toISOString()}
              fill={colorScale(biker.Doping !== "")}
              onMouseOver={(e) => {
                setSelectedBiker(biker);
                setPos({ xPos: e.clientX + 28, yPos: e.clientY + 28 });
              }}
              onMouseOut={() => {
                setSelectedBiker(null);
              }}
            />
          ))}
      </svg>
    </div>
  );
};

export default App;
