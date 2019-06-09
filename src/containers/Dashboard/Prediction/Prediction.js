import React, { Component } from "react";
import propTypes from "prop-types";

import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions/actionTypes';

import { WhisperSpinner } from "react-spinners-kit";

class Integration extends Component {

  state = {
      predicted_results: [],
      isStarted: false,
      isPredicted: false,
      isLoading: false,
      options: {
        chart: {
          id: "predictionGraph"
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994]
        }
      },
      series: [
        {
          name: 'Volatility Indices',
          data: []
        }
      ]
  }

  static propTypes = {
    // isAuthenticated: propTypes.bool.isRequired,
    // binaryAPI: propTypes.object.isRequired,
    // validateToken: propTypes.func.isRequired,
    // addToken: propTypes.func.isRequired,
    // alertZeroTokenError: propTypes.func.isRequired
  }

    handlePredictionClick = (event) => {
        event.preventDefault();
        this.setState({
            isLoading: true,
            isStarted: true
        }, () => {
            console.log(this.state);
        });
        let ws = new WebSocket('ws://localhost:8000/ml/');
        console.log(ws);
        ws.onopen = (evt) => {
            console.log('Open');
            this.props.startPredict();
            ws.send(JSON.stringify({test: "Prediction"}));
        }

        ws.onmessage = (msg) => {
            const results = JSON.parse(msg.data);
            console.log('Message', results);
            this.setState({
                predicted_results: results,
                isLoading: false,
                isPredicted: true,
                isStarted: false
            }, () => {
                ApexCharts.exec('predictionGraph', 'updateSeries', [{
                    data: results
                }], true, true);
                console.log(this.state);
            });
        }

        ws.onerror = (error) => {
            console.log('Error', error);
        }
    }

    render() {
        return (
            <div className="col">
                <div className="row mb-3">
                    <div className="col">
                        <div className="card text-left">
                            <div className="card-header">
                                <h4>Predictions</h4>
                            </div>
                            <div className="card-body">
                                <h4>Start your predictions...</h4>
                                <button className="btn btn-primary" onClick={this.handlePredictionClick}>
                                    Start
                                </button>
                                {this.state.isLoading ? 
                                    <div className="col my-5 py-5 d-flex justify-content-center">
                                        <WhisperSpinner
                                                size={50}
                                                color="#126246f"
                                                loading={!this.state.isLoaded}
                                        />
                                    </div>
                                    :
                                    null
                                }
                                {this.state.isPredicted ?
                                    <div className="col-md-12 mixed-chart">
                                        <Chart
                                            options={this.state.options}
                                            series={this.state.series}
                                            type="line"
                                        />
                                    </div>
                                    :
                                    null
                                }

                            </div>
                            <div className="card-footer">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
  }
}

const mapStateToProps = state => {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      binaryAPI: state.webapi,
      tick: state.tick
    };
};

const mapDispatchToProps = dispatch => {
    return {
        startPredict: () => dispatch({
            type: actionTypes.PREDICTION_START
        }),

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Integration);