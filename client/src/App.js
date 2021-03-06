import React, { Component } from "react";
import "./App.css";
import idx from "idx";
import {
  Collapse,
  Input,
  Button,
  Form,
  Icon,
  Alert,
  message,
  Popconfirm,
} from "antd";

import { Parser } from "json2csv";
const fields = ["id", "name", "company", "invoice", "password", "others"];
const opts = { fields };

const Panel = Collapse.Panel;
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.callLogin(values)
          .then((res) => {
            console.log("here res:", res);
            this.props.setLogin(res.isLoggedin);
          })
          .catch((err) => {
            console.log("error:", err);
            message.error("Invalid Login! Try again");
          });
      }
    });
  };

  callLogin = async (values) => {
    const response = await fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
      headers: { "Content-Type": "application/json" },
    });

    console.log("login response:", response);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Please input your username!" }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Username"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your Password!" }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const LoginForm = Form.create()(NormalLoginForm);

class AddForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.callAdd(values)
          .then((res) => {
            this.props.getAllCustomers();
            message.success("Successfully added new customer: " + values.name);
          })
          .catch((error) => {
            console.log(error);
            message.error("Something went wrong!");
          });
        this.props.form.setFieldsValue({
          name: "",
          company: "",
        });
      }
    });
  };

  callAdd = async (values) => {
    const response = await fetch("/add", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res);

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "Please input Name!" }],
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="Name"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator("company", {
              rules: [{ required: true, message: "Please input Company!" }],
            })(
              <Input
                prefix={
                  <Icon type="profile" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="Company"
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              onClick={this.handleAdd}
            >
              Add
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedAddForm = Form.create()(AddForm);

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

class AddNewCustomer extends Component {
  render() {
    return (
      <div className="left-filter">
        <Collapse>
          <Panel header={"Add New Customer"} key="1">
            <WrappedAddForm getAllCustomers={this.props.getAllCustomers} />
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
        : "",
      invoiceSaved: false,
      passwordSaved: false,
      othersSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.selectedCustomer) !==
      JSON.stringify(prevProps.selectedCustomer)
    ) {
      this.setState({
        invoice: idx(this.props, (_) => _.selectedCustomer.invoice)
          ? this.props.selectedCustomer.invoice
          : "",
        password: idx(this.props, (_) => _.selectedCustomer.password)
          ? this.props.selectedCustomer.password
          : "",
        others: idx(this.props, (_) => _.selectedCustomer.others)
          ? this.props.selectedCustomer.others
          : "",
      });
    }
  }

  handleSave(field, value) {
    this.callSave(field, value)
      .then((res) => {
        this.setState({ [field + "Saved"]: true }, () => {
          setTimeout(() => this.setState({ [field + "Saved"]: false }), 1800);
        });
      })
      .catch((err) => {
        console.log(err);
        message.error("Something went wrong. You data is not saved!!");
      });
  }

  callSave = async (field, value) => {
    let content = null;
    switch (field) {
      case "invoice":
        content = { invoice: value, id: this.props.selectedCustomer.id };
        break;
      case "password":
        content = { password: value, id: this.props.selectedCustomer.id };
        break;
      case "others":
        content = { others: value, id: this.props.selectedCustomer.id };
        break;
      default:
        console.log("Field name is wrong");
    }
    const response = await fetch("/save/" + field, {
      method: "POST",
      body: JSON.stringify(content),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res);

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  handleTextareaChange(event, field) {
    this.setState({ [field]: event.target.value });
    this.handleSave(field, event.target.value);
  }

  notePanel = (panelName) => {
    let lowerCaseName = panelName.toLowerCase();
    return (
      <Panel header={panelName} key={panelName}>
        <textarea
          ref={(textarea) => (this[lowerCaseName] = textarea)}
          value={this.state[lowerCaseName]}
          onChange={(e) => this.handleTextareaChange(e, lowerCaseName)}
        />
        {this.state[lowerCaseName + "Saved"] ? (
          <small>
            <Icon
              type="check-circle"
              theme="filled"
              style={{ color: "#52c41a" }}
            />{" "}
            Saved
          </small>
        ) : null}
      </Panel>
    );
  };

  render() {
    return (
      <div className="customer-main">
        {this.props.selectedCustomer ? (
          <div>
            {" "}
            <h1>{this.props.selectedCustomer.name}</h1>
            <Collapse
              bordered={false}
              defaultActiveKey={["Invoice", "Password", "Others"]}
            >
              {this.notePanel("Invoice")}
              {this.notePanel("Password")}
              {this.notePanel("Others")}
            </Collapse>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

class AllCustomers extends Component {
  componentDidMount() {
    this.props.getAllCustomers();
  }
  confirm(customerId) {
    this.handleDelete(customerId);
  }
  handleDelete(customerId) {
    this.callDelete(customerId)
      .then((res) => {
        message.success("Successfully Deleted");
        //this.props.setSelectedCustomer();
        this.props.getAllCustomers();
      })
      .catch((err) => {
        console.log(err);
        message.error("Something went wrong!!");
      })
      .then(() => {
        if (customerId == this.props.selectedCustomer.id) {
          this.props.setSelectedCustomer();
        }
      });
  }
  callDelete = async (customerId) => {
    const response = await fetch("/delete", {
      method: "POST",
      body: JSON.stringify({ customerId: customerId }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res);

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  cancel(e) {}
  render() {
    return (
      <div className="left-body">
        {this.props.customersAll
          ? this.props.customersAll.map((customer) => {
              if (
                this.props.filter == null ||
                customer.name
                  .toLowerCase()
                  .includes(this.props.filter.toLowerCase()) ||
                customer.company
                  .toLowerCase()
                  .includes(this.props.filter.toLowerCase())
              ) {
                return (
                  <li key={customer.id}>
                    <div className="alluser-userinfo">
                      <p
                        className="alluser-name"
                        onClick={(e) =>
                          this.props.handleCustomerSelection(e, customer)
                        }
                      >
                        {customer.name}
                      </p>
                      <p>@{customer.company}</p>
                    </div>
                    <Popconfirm
                      title="Are you sure delete this customer?"
                      onConfirm={() => this.confirm(customer.id)}
                      onCancel={this.cancel}
                      okText="Yes"
                      cancelText="No"
                    >
                      <a href="#">Delete</a>
                    </Popconfirm>
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
      customersAll: [],
      isLoggedin: null,
    };
  }
  componentDidMount() {
    this.callCheckLogin()
      .then((res) => {
        this.setState({ isLoggedin: res.isLoggedin });
      })
      .catch((error) => console.log(error));
  }

  callCheckLogin = async () => {
    const response = await fetch("/checkLogin");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  getAllCustomers() {
    this.callCustomers()
      .then((res) =>
        this.setState({
          customersAll: res,
        })
      )
      .catch((err) => console.log(err));
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

  setSelectedCustomer() {
    this.setState({
      selectedCustomer: null,
    });
  }
  handleCustomerSelection(e, customer) {
    const card = e.target.parentNode.parentNode;
    const allCards = card.parentNode.childNodes;
    allCards.forEach((e) => e.classList.remove("active"));
    card.classList.add("active");
    this.callSelectedCustomers(customer.id)
      .then((res) => {
        this.setState({
          selectedCustomer: res[0],
        });
      })
      .catch((err) => console.log(err));
  }

  callSelectedCustomers = async (id) => {
    const response = await fetch("/customers/" + id);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  setLogin(isLoggedin) {
    this.setState({ isLoggedin: isLoggedin });
  }

  downloadButtonOnClick = (e) => {
    e.preventDefault();
    this.callDownload()
      .then((res) => {
        const parser = new Parser(opts);
        const csv = parser.parse(res.data);
        const hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        hiddenElement.target = "_blank";
        hiddenElement.download = "note-data.csv";
        hiddenElement.click();
      })
      .catch((err) => {
        console.log(err);
        message.error("Failed to download");
      });
  };

  callDownload = async () => {
    const response = await fetch("/download");
    const body = await response.json();
    if (response.status !== 200) throw Error(response);
    return body;
  };

  render() {
    return (
      <div>
        {this.state.isLoggedin ? (
          <div className="App">
            <div className="left-column">
              <div className="download">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => this.downloadButtonOnClick(e)}
                >
                  {" "}
                  Download Backup Data{" "}
                </button>
              </div>
              <AddNewCustomer
                getAllCustomers={this.getAllCustomers.bind(this)}
              />
              <Filter onChange={this.onChange.bind(this)} />
              <AllCustomers
                handleCustomerSelection={this.handleCustomerSelection.bind(
                  this
                )}
                filter={this.state.filter}
                getAllCustomers={this.getAllCustomers.bind(this)}
                customersAll={this.state.customersAll}
                setSelectedCustomer={this.setSelectedCustomer.bind(this)}
                selectedCustomer={this.state.selectedCustomer}
              />
            </div>

            <div className="right-column">
              <Customer selectedCustomer={this.state.selectedCustomer} />
            </div>
          </div>
        ) : (
          <div className="login">
            <h1>API Customer notes</h1>
            <div className="login-form-div">
              <LoginForm setLogin={this.setLogin.bind(this)} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
