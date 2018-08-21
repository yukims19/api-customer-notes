import React, { Component } from "react";
import "./App.css";
import { Collapse, Input, Button } from "antd";
const Panel = Collapse.Panel;

class Filter extends Component {
  render() {
    return (
      <div className="left-filter">
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Filter" key="1">
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
  constructor(props) {
    super(props);
    this.state = {
      invoice: this.props.selectedCustomer
        ? this.props.selectedCustomer.invoice
        : "",
      password: this.props.selectedCustomer
        ? this.props.selectedCustomer.password
        : "",
      others: this.props.selectedCustomer
        ? this.props.selectedCustomer.others
        : ""
    };
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.selectedCustomer) !==
      JSON.stringify(prevProps.selectedCustomer)
    ) {
      console.log("not mathcing");
      this.setState(
        {
          invoice: this.props.selectedCustomer.invoice
            ? this.props.selectedCustomer.invoice
            : "",
          password: this.props.selectedCustomer.password
            ? this.props.selectedCustomer.password
            : "",
          others: this.props.selectedCustomer.others
            ? this.props.selectedCustomer.others
            : ""
        },
        () => {
          console.log(this.state.invoice);
        }
      );
    }
  }

  handleSave(field, customerId) {
    this.callSave(field, customerId).catch(err => console.log(err));
  }
  callSave = async (field, customerId) => {
    let content = null;
    switch (field) {
      case "invoice":
        content = { invoice: this.invoice.value, id: customerId };
        break;
      case "password":
        content = { password: this.password.value, id: customerId };
        break;
      case "others":
        content = { others: this.others.value, id: customerId };
        break;
      default:
        console.log("Wrong");
    }
    const response = await fetch("/save/" + field, {
      method: "POST",
      body: JSON.stringify(content),
      headers: { "Content-Type": "application/json" }
    }).then(res => res);

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  handleTextareaChange(event, field) {
    this.setState({ [field]: event.target.value });
  }
  render() {
    return (
      <div className="customer-main">
        {this.props.selectedCustomer
          ? <div>
              {" "}<h1>{this.props.selectedCustomer.name}</h1>
              <Collapse bordered={false} defaultActiveKey={["1"]}>
                <Panel header="Invoice" key="1">
                  <textarea
                    ref={textarea => (this.invoice = textarea)}
                    value={this.state.invoice}
                    onChange={e => this.handleTextareaChange(e, "invoice")}
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      this.handleSave(
                        "invoice",
                        this.props.selectedCustomer.id
                      )}
                  >
                    Save
                  </Button>
                </Panel>
                <Panel header="Password" key="2">
                  <textarea
                    ref={textarea => (this.password = textarea)}
                    value={this.state.password}
                    onChange={e => this.handleTextareaChange(e, "password")}
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      this.handleSave(
                        "password",
                        this.props.selectedCustomer.id
                      )}
                  >
                    Save
                  </Button>
                </Panel>
                <Panel header="Others" key="3">
                  <textarea
                    ref={textarea => (this.others = textarea)}
                    value={this.state.others}
                    onChange={e => this.handleTextareaChange(e, "others")}
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      this.handleSave("others", this.props.selectedCustomer.id)}
                  >
                    Save
                  </Button>
                </Panel>
              </Collapse>
            </div>
          : ""}
      </div>
    );
  }
}

class AllCustomers extends Component {
  componentDidMount() {
    this.props.getAllCustomers();
  }

  render() {
    return (
      <div className="left-body">
        {this.props.customersAll
          ? this.props.customersAll.map(customer => {
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
      selectedCustomer: null,
      customersAll: []
    };
  }
  getAllCustomers() {
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

  onChange(event) {
    this.setState({ filter: event.target.value });
  }

  handleCustomerSelection(customer) {
    this.callSelectedCustomers(customer.id)
      .then(res => {
        this.setState({
          selectedCustomer: res[0]
        });
      })
      .catch(err => console.log(err));
  }

  callSelectedCustomers = async id => {
    const response = await fetch("/customers/" + id);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="App">
        <div className="left-column">
          <Filter onChange={this.onChange.bind(this)} />
          <AllCustomers
            handleCustomerSelection={this.handleCustomerSelection.bind(this)}
            filter={this.state.filter}
            getAllCustomers={this.getAllCustomers.bind(this)}
            customersAll={this.state.customersAll}
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
