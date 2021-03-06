# ContestContract
Helps people contribute money to a project, and choose judges to distribute it for various solutions.

# Deploy
when deploy it is need to pass parameters in to init method
Params:
name  | type | description
--|--|--
stagesCount|uint256|count of stages for Contest
stagesMinAmount|uint256|array of minimum amount that need to reach at each stage. length array should be the same as stagesCount
contestPeriodInSeconds|uint256|duration in seconds  for contest period(exclude before reach minimum amount)
votePeriodInSeconds|uint256|duration in seconds  for voting period
revokePeriodInSeconds|uint256|duration in seconds  for revoking period
percentForWinners|uint256[]|array of values in percentages of overall amount that will gain winners
judges|address[]|array of judges' addresses. if empty than everyone can vote

## Settings
name|type|value|description
--|--|--|--
revokeFee|uint256|10e4|10% mul at 1e6. penalty for revoke tokens

# Overview
once installed will be use methods:

<table>
<thead>
	<tr>
		<th>method name</th>
		<th>called by</th>
        <th>contract</th>
		<th>description</th>
	</tr>
</thead>
<tbody>
	<tr>
		<td><a href="#iscontestonline">isContestOnline</a></td>
		<td>anyone</td>
        <td>boths</td>
		<td>Checking online Contest</td>
	</tr>
	<tr>
		<td><a href="#pledge">pledge</a></td>
		<td>anyone</td>
        <td>Constest.sol only</td>
		<td>can be used to send external token into the contract, and issue internal token balance</td>
	</tr>
	<tr>
		<td><a href="#pledgeeth">pledgeETH</a></td>
		<td>anyone</td>
        <td>ConstestETHOnly.sol only</td>
		<td>can be used to send ETH into the contract, and issue internal token balance</td>
	</tr>
	<tr>
		<td><a href="#delegate">delegate</a></td>
		<td>anyone outside the contestant list</td>
        <td>boths</td>
		<td>user can delegate own vote</td>
	</tr>
	<tr>
		<td><a href="#vote">vote</a></td>
		<td>anyone on the judge list <br>(if judgelist empty anyone outside the contestant list)</td>
        <td>boths</td>
		<td>vote for contestant</td>
	</tr>
	<tr>
		<td><a href="#claim">claim</a></td>
		<td>anyone on the contestant list</td>
        <td>boths</td>
		<td>claim funds</td>
	</tr>
	<tr>
		<td><a href="#enter">enter</a></td>
		<td>anyone</td>
        <td>boths</td>
		<td>sender is become a contestant</td>
	</tr>
	<tr>
		<td><a href="#leave">leave</a></td>
		<td>anyone on the contestant list</td>
        <td>boths</td>
		<td>sender leave from contest</td>
	</tr>
	<tr>
		<td><a href="#revoke">revoke</a></td>
		<td>anyone outside the contestant list</td>
        <td>boths</td>
		<td>revoke own vote or delegation</td>
	</tr>
</tbody>
</table>

## Methods

#### isContestOnline
Checking online Contest
Params:
name  | type | description
--|--|--
stageID|uint256|Stage number

#### pledge
can be used only with Constest.sol to send external token into the contract, and issue internal token balance
Params:
name  | type | description
--|--|--
amount|uint256|amount to pledge
stageID|uint256|Stage number

#### pledgeETH
can be used only with ConstestETHOnly.sol to send ETH into the contract, and issue internal token balance
Note that ETH need to send with transaction/ not directly to contract via native `recieve()`
Params:
name  | type | description
--|--|--
amount|uint256|amount to pledge
stageID|uint256|Stage number
    
#### delegate
Params:
name  | type | description
--|--|--
judge|address|address of judge which user want to delegate own vote
stageID|uint256|Stage number

#### vote
Params:
name  | type | description
--|--|--
contestantAddress|address|address of contestant which user want to vote
stageID|uint256|Stage number

#### claim
Params:
name  | type | description
--|--|--
stageID|uint256|Stage number

#### enter
Params:
name  | type | description
--|--|--
stageID|uint256|Stage number

#### leave
Params:
name  | type | description
--|--|--
stageID|uint256|Stage number

#### revoke
Params:
name  | type | description
--|--|--
stageID|uint256|Stage number

## Lifecycle of Contest
* creation Contest.  emitting event `ContestStart`. Starting Contest Period with `StageID` = 0
    * anyone can enter to contest calling method `enter()` and become contestant
    * anyone can leave to contest calling method `leave()` and remove itself from contestant list
    * anyone can pledge smth to contest calling method `pledge()` if didn't not become contestant earlier
* as soon as pledging by people become more than "stagesMinAmount" Contest Period will be extended for `contestPeriodInSeconds` seconds. and stop there
    * emitting `StageStartAnnounced`
* starting Voting period for `votePeriodInSeconds` seconds.
    * judge can vote for contestants
    * if judgeList was empty then anyone who pledged before can vote
    * anyone who pledged before can revoke own tokens with gradually increased penalty from 0 to revokeFee
* starting Revoking period for `revokePeriodInSeconds` seconds.
    * anyone who pledged before can revoke own tokens with revokeFee penalty
* Stage completed.(after any request with `stageID`).
    * emitting `ContestWinnerAnnounced`
    * if winners exists, then
        * reward winners
        * reward losers (if left smth from winners) they will get equally
    * if winners does not exists, then all who pledged will get equally
    * next stage will begin if current stage < `stagesCount`

