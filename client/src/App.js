import React, { Component } from "react";
import "./App.css";
import { Collapse, Input } from "antd";
const Panel = Collapse.Panel;

class Filter extends Component {
  render() {
    return (
      <div className="left-filter">
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Filter" key="1">
            {/*<input
              id="post-filter"
              type="text"
              placeholder="Filter By Name"
              ref="postfilter"
              onChange={this.props.onChange}
            />*/}
            <Input
              placeholder="Enter Customer Name"
              onChange={this.props.onChange}
            />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

class Customer extends Component {
  render() {
    return (
      <div className="customer-main">
        {this.props.selectedCustomer
          ? <h1>
              {this.props.selectedCustomer.name}
            </h1>
          : ""}
      </div>
    );
  }
}

class AllCustomers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customersAll: []
    };
  }
  componentDidMount() {
    this.callCustomers()
      .then(res =>
        this.setState({
          customersAll: res
        })
      )
      .catch(err => console.log(err));
  }

  callCustomers = async () => {
    const response = await fetch("/customers");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="left-body">
        {this.state.customersAll
          ? this.state.customersAll.map(customer => {
              if (
                this.props.filter == null ||
                customer.name
                  .toLowerCase()
                  .includes(this.props.filter.toLowerCase())
              ) {
                return (
                  <li
                    key={customer.id}
                    onClick={() => this.props.handleCustomerSelection(customer)}
                  >
                    <div className="alluser-userinfo">
                      <p className="alluser-name">
                        {customer.name}
                      </p>
                      <p>
                        @{customer.company}
                      </p>
                    </div>
                  </li>
                );
              }
            })
          : ""}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: null,
      selectedCustomer: null
    };
  }
  onChange(event) {
    this.setState({ filter: event.target.value });
  }
  handleCustomerSelection(customer) {
    console.log("selected");
    console.log(customer);
    this.setState({ selectedCustomer: customer });
  }
  render() {
    return (
      <div className="App">
        <div className="left-column">
          <Filter onChange={this.onChange.bind(this)} />
          <AllCustomers
            handleCustomerSelection={this.handleCustomerSelection.bind(this)}
            filter={this.state.filter}
          />
        </div>

        <div className="right-column">
          <Customer selectedCustomer={this.state.selectedCustomer} />
        </div>
      </div>
    );
  }
}

export default App;
