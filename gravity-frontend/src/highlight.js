import React, { Component } from 'react';
import HighlightPill from './pill.js';
import { store } from "./redux_store.js";
import { connect } from 'react-redux';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';

class HighlightsPanel extends Component {

  componentWillMount(){
  }

  render() {

    var highlights = [];

    if(this.props.highlights !== undefined) {
      for (var i = 0; i < this.props.highlights.length; i++) {
        var h = this.props.highlights[i];
        highlights.push(<HighlightPill key={i} label={h.name} value={h.value}
          description={h.description} className=""  />)
      }
    }

    return (
      <div className='row stats-row'>
        <label className='stat-label'>{this.props.label}</label>
        {highlights}
      </div>
    )
  }

}


class MapPanel extends Component {

  componentWillMount() {
  }

  hourSelectOnChange(e) {
    var value = e.target.value;
    console.log("Hour Selected: " + value);
    store.dispatch({
      type: "GEO_HOUR_CHANGE",
      selected_hour: value
    });
  }



  render() {
    var url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
    const mapCenter = [12.9850, 80.2707];
    const zoomLevel = 10.5;
    var props = this.props;

    const getKey = function(wardNo) {
      return "Ward-" + wardNo;
    }

    var mapStyle = function(feature) {
      var hourData = props.ward_counts[props.selected_hour];
      var colorChoice = "#1c1c1c";
      if(hourData !== undefined) {
        var key = getKey(feature.properties.WARD_NO);
        var count = hourData[key] || 0;
        if(count > 0) {
          colorChoice = "#FED976";
        } else if (count > 1) {
          colorChoice = "#FEB24C";
        } else if (count > 2) {
          colorChoice = "#FD8D3C";
        }
      }
      return {
        fillColor: colorChoice,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    };

    var component = this;

    var onEachFeature = function(feature, layer) {
      if(feature.properties.WARD_NO) {
        const getMessage = function() {
          const wardNo = feature.properties.WARD_NO;
          const hourData = component.props.ward_counts[component.props.selected_hour];
          console.log(props);
          var count = 0;
          if(hourData !== undefined) {
            count =  hourData[getKey(wardNo)] || 0;
          }
          return "Ward: " + wardNo  + " Complaints: " + count;
        }

        layer.bindPopup(getMessage);
      } else {
          console.log(feature.properties);
      }
    }

    var map = document.getElementById("ward-map");
    var hourSelectStyle = {};
    if(map !== null) {
      var pos = map.getBoundingClientRect();

      hourSelectStyle.left = (pos.right - 175) + "px";
      hourSelectStyle.top = (pos.top + 10) + "px";
      hourSelectStyle.zIndex = 5000;
    }

    return(
      <div className="content-wrapper-fixed-height">
        <input id="hour_select" type="range" min="0" max="24" step="1"
          value={this.props.selected_hour} onChange={this.hourSelectOnChange}
          style={hourSelectStyle} />
        <Map id="ward-map"
          center={mapCenter}
          zoom={zoomLevel}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false} >
          <TileLayer
            attribution={attribution}
            url={url} />
          <GeoJSON
            data={this.props.ward_geo_json}
            style={mapStyle}
            onEachFeature={onEachFeature}
            ref="geojson" />
        </Map>
        <div className="summary-stats-container">
          <div className="stat-category">
            <h3>Summary</h3>
            <div>
              <span>32</span>
              <label>Alerts in the hour</label>
            </div>
            <div>
              <span>32</span>
              <label>Alerts in the week</label>
            </div>
            <div>
              <span>32</span>
              <label>Alerts in the month</label>
            </div>
          </div>
          <div className="stat-category">
            <h3>Alerts</h3>
            <div>
              <span>32</span>
              <label>Label</label>
            </div>
          </div>
          <div className="stat-category">
            <h3>Forecast</h3>
            <div>
              <span>32</span>
              <label>Label</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}



class HighlightsTab extends Component {
  render() {
    return (
      <div>
        <MapPanel ward_geo_json={this.props.ward_geo_json}
          selected_hour={this.props.selected_hour}
          ward_counts={this.props.ward_counts} />
      </div>
    );
  }
}

/*

 <HighlightsPanel label='summary' highlights={this.props.highlights.general} ></HighlightsPanel>
 <HighlightsPanel label='alerts' highlights={this.props.highlights.alerts}></HighlightsPanel>
 <HighlightsPanel label='forecasts' highlights={this.props.highlights.forecasts}></HighlightsPanel>
 */



const mapStateToProps = function(store) {
  return {
    highlights: store.highlights,
    ward_geo_json: store.ward_map.ward_geo_json,
    selected_hour: store.ward_map.selected_hour,
    ward_counts: store.ward_map.data
  };
}

export {HighlightsPanel};
export default connect(mapStateToProps)(HighlightsTab);
