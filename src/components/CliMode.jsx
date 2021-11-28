import React from 'react'
import Terminal from 'react-console-emulator'
import PropTypes from 'prop-types';
import Table from 'rc-table';
import Big from 'big.js';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const CliMode = ({ contract, currentUser, nearConfig, wallet }) => {

  const poll_columns = [


    {
      title: 'Poll Id',
      dataIndex: 'pool_id',
      key: 'pool_id',

    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      width: 10,
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',

    },
    // {
    //   title: 'Operations',
    //   dataIndex: '',
    //   key: 'operations',
    //   render: () => <a href="#">Show More</a>,
    // },
  ];

  const vote_columns = [
    {
      title:'Option name',
      key: 'option_id',
      dataIndex: 'option_id'
    },
    {
      title:'Option description',
      key: 'option_desc',
      dataIndex: 'option_desc'
    }
  ];

  const result_columns = [
    {
      title:'Poll ID',
      key: 'pool_id',
      dataIndex: 'pool_id'
    },
    {
      title:'Voting Status',
      key: 'voting_counts',
      dataIndex: 'voting_counts'
    },
    {
      title:'Voting Details',
      key: 'voted',
      dataIndex: 'voted'
    },

  ]




    const [poll_info,set_poll_info] = React.useState("")
    const [voting_info,set_voting_info] = React.useState("")
    const [vote_result,set_vote_result] = React.useState("")
    const [res,set_res] = React.useState("")

    function logout(){
      wallet.signOut();
      window.location.replace(window.location.origin + window.location.pathname);
      set_poll_info("");
      set_voting_info("");
      return "Loged out." 
    };

    function login(){
      wallet.requestSignIn(nearConfig.contractName,'VoteSystem');
      return "Waiting for response..."
    }

    const commands = {
      // echo: {
      //   description: 'Echo a passed string.',
      //   usage: 'echo <string>',
      //   fn: function () {
      //     return `${Array.from(arguments).join(' ')}`
      //   }
      // },
      logout: {
        description: 'logout your wallet',
        fn: function(){
          return `${currentUser?logout():"You are not logged in"}`
        }
      },
      login: {
        description: 'login your wallet',
        fn: function(){
          return `${currentUser
          ?"You should logout before you login"
          :login()
          }`
        }
      },
      who: {
        description: 'show your account',
        fn: function(){
          return `${currentUser? currentUser.accountId:"You are not logged in"}`
        }
      },
      show: {
        description: 'show all ongoing voting',
        fn: function(){
          contract.show_pools().then(x => {set_poll_info(x);console.log(x)});
          return `${
             "Fetching response from blockchain..."
          }`
        }
      },
      check:{
        description: 'check the voting',
        usage: 'check <poll_id>',
        fn: function(poll_id){
          contract.show_pool({"pool_id":poll_id}).then(x=>{set_voting_info(x);console.log("voting_info : "+JSON.stringify(x))});
          return "Waiting for response..."
        }
      },
      vote:{
        description: 'vote for option',
        usage: 'vote <poll_id> <option_name>',
        fn: function(){
          const args = Array.from(arguments);
          if(!currentUser){
            return "You must login first."
          }else{
            if(args.length!=2){
              return "need exactly 2 arguments.And don't support space in argument yet"
            }else{
              if(args[0]==="" || args[1]===""){
                return "You have an invalid argument."
              }
              contract.vote({"pool_id":args[0],"option_id":args[1]}).then(x=>{set_vote_result(x);console.log("vote result:"+ JSON.stringify(x))});
              return "voting... check result later..."
            }
          }
        }
      },
      create:{
        description: 'create a new  poll, charge 1 NEAR. ',
        usage: 'create <question>',
        fn: function(){
          const args = Array.from(arguments);
          if(!currentUser){
            return "You must login first."
          }else{
            if(args.length!=1){
              return "need exactly 1 arguments.And don't support space in argument yet"
            }else{
              if(args[0]===""){
                return "Must specify the Question."
              }
              contract.create_pool({"question":args[0]},
              BOATLOAD_OF_GAS, // attached GAS (optional)
              Big('1').times(10 ** 24).toFixed()
              ).then(x=>{set_vote_result(x);console.log("create result"+ JSON.stringify(x))});
              return "creating vote poll...use `show` to check later " 
            }
          }
        }
      },
      add:{
        description: 'add a new option for a poll. Charge 0.5 Near',
        usage: 'add <poll_id> <option_name> <option_description>',
        fn: function(){
          const args = Array.from(arguments);
          if(!currentUser){
            return "You must login first."
          }else{
            if(args.length!=3){
              return "need exactly 3 arguments.And don't support space in argument yet"
            }else{
              if(args[0]==="" || args[1]===""|| args[2]===""){
                return "You have an invalid argument."
              }
              contract.add_option(
                {"pool_id":args[0],"voting_options":{"option_id":args[1],"option_desc":args[2]}},
                BOATLOAD_OF_GAS, // attached GAS (optional)
                Big('0.5').times(10 ** 24).toFixed()
                ).then(x=>{console.log("you may want to check later.."+ JSON.stringify(x))});
              return "adding option...`check` later " 
            }
          }
        }
      },
      result:{
        description: 'check the poll\'s result',
        usage: 'result <poll_id> ',
        fn: function(poll_id){
          if(poll_id===""){
            return "Must specify poll_id."
          }
          contract.show_results({"pool_id":poll_id}).then(x=>{set_res(x);console.log("poll result"+ JSON.stringify(x))});
          return "Waiting for response..."
        }
      }
    }
  
  
    return (
  
      <div backgroundColor="black">
        {
          poll_info===""?
            ""
          :<div><Table tableLayout="auto" columns={poll_columns} data={poll_info} /></div>
        }
        
      
      <div align="left">
              <Terminal
          commands={commands}
          welcomeMessage={['Welcome to the NEAR platform\'s WebOS for Voting!','------------------------------------------------',
            'Use the `help` command to get more instructions.'
          ]}
          promptLabel={`${currentUser?currentUser.accountId:"anonymous"}@NEAR:~$`}
          noEchoBack
          autoFocus
          noNewlineParsing
        />
        </div>

      <div>
      {
          voting_info===""?
            ""
          :<div><Table tableLayout="auto" columns={vote_columns} data={voting_info.voting_options} /></div>
        }

      </div>
     
      <div>
      <br/>
  
      {res?JSON.stringify(res.result,null,2):""}
      </div>
    </div>
  
    );
  
  };
  
  CliMode.propTypes = {
    contract: PropTypes.shape({
      show_pools: PropTypes.func.isRequired,
      show_pool: PropTypes.func.isRequired,
      show_results: PropTypes.func.isRequired,
      create_pool: PropTypes.func.isRequired,
      add_option: PropTypes.func.isRequired,
      vote: PropTypes.func.isRequired
    }).isRequired,
    currentUser: PropTypes.shape({
      accountId: PropTypes.string.isRequired,
      balance: PropTypes.string.isRequired
    }),
    nearConfig: PropTypes.shape({
      contractName: PropTypes.string.isRequired
    }).isRequired,
    wallet: PropTypes.shape({
      requestSignIn: PropTypes.func.isRequired,
      signOut: PropTypes.func.isRequired
    }).isRequired
  };
  
  export default CliMode;