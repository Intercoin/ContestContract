pragma solidity >=0.6.0 <0.7.0;

import "./openzeppelin-contracts/contracts/math/SafeMath.sol";
import "./openzeppelin-contracts/contracts/utils/EnumerableSet.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";

contract ContestBase is Ownable {
    
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeMath for uint256;

    // ** deprecated 
    // delegateFee (some constant in contract) which is percent of amount. They can delegate their entire amount of vote to the judge, or some.
    // uint256 delegateFee = 5e4; // 5% mul at 1e6
    
    // penalty for revoke tokens
    uint256 revokeFee = 10e4; // 10% mul at 1e6
    
    EnumerableSet.AddressSet private _judgesWhitelist;
    EnumerableSet.AddressSet private _personsList;
    
    mapping (address => uint256) private _balances;
    
    Contest _contest;
    
    struct Contest {
        uint256 stage;
        uint256 stagesCount;
        mapping (uint256 => Stage) _stages;

    }
	
    struct Stage {
        uint256 winnerWeight;

        mapping (uint256 => address[]) winners;
        bool winnersLock;

        uint256 amount;     // acummulated all pledged 
        uint256 minAmount;
        
        bool active;    // stage will be active after riched minAmount
        bool completed; // true if stage already processed
        uint256 startTimestampUtc;
        uint256 contestPeriod; // in seconds
        uint256 votePeriod; // in seconds
        uint256 revokePeriod; // in seconds
        uint256 endTimestampUtc;
        EnumerableSet.AddressSet contestsList;
        EnumerableSet.AddressSet pledgesList;
        EnumerableSet.AddressSet judgesList;
        EnumerableSet.UintSet percentForWinners;
        mapping (address => Participant) participants;
    }
   
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single participant at single stage
    struct Participant {
        uint256 weight; // user weight
        uint256 balance; // user balance
        uint256 balanceAfter; // balance after calculate
        bool voted;  // if true, that person already voted
        address voteTo; // person voted to
        bool delegated;  // if true, that person delegated to some1
        address delegateTo; // person delegated to
        EnumerableSet.AddressSet delegatedBy; // participant who delegated own weight
        EnumerableSet.AddressSet votedBy; // participant who delegated own weight
        bool won;  // if true, that person won round. setup after EndOfStage
        bool claimed; // if true, that person claimed them prise if won ofc
        bool revoked; // if true, that person revoked from current stage
        //bool left; // if true, that person left from current stage and contestant list
        bool active; // always true

    }

	event ContestStart();
    event ContestComplete();
    event ContestWinnerAnnounced(address[] indexed winners);
    event StageStartAnnounced(uint256 indexed stageID);
    event StageCompleted(uint256 indexed stageID);
    
    
	////
	// modifiers section
	////
    modifier onlyNotVotedNotDelegated(address account, uint256 stageID) {
         require(
             (_contest._stages[stageID].participants[account].voted == false) && 
             (_contest._stages[stageID].participants[account].delegated == false), 
            "Person must have not voted or delegated before"
        );
        _;
    }
    modifier judgeNotDelegatedBefore(address account, uint256 stageID) {
         require(
             (_contest._stages[stageID].participants[account].delegated == false), 
            "Judge has been already delegated"
        );
        _;
    }
    modifier stageActive(uint256 stageID) {
        require(
            (_contest._stages[stageID].active == true), 
            "Stage have still in gathering mode"
        );
        _;
    }
    
    modifier stageNotCompleted(uint256 stageID) {
        require(
            (_contest._stages[stageID].completed == false), 
            "Stage have not completed yet"
        );
        _;
    }
 
    modifier canPledge(uint256 stageID) {
        uint256 endContestTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod);
        require(
            (
                (
                    _contest._stages[stageID].active == false
                ) || 
                (
                    (_contest._stages[stageID].active == true) && (endContestTimestamp > now)
                )
            ), 
            "Stage is out of contest period"
        );
        _;
    }

    modifier canDelegateAndVote(uint256 stageID) {
        uint256 endContestTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod);
        uint256 endVoteTimestamp = endContestTimestamp.add(_contest._stages[stageID].votePeriod);
        require(
            (
                (_contest._stages[stageID].active == true) && 
                (endVoteTimestamp > now) && 
                (now >= endContestTimestamp)
            ), 
            "Stage is out of voting period"
        );
        _;
    }
    
    modifier canRevoke(uint256 stageID) {
        uint256 endVoteTimestamp = (_contest._stages[stageID].startTimestampUtc).add(_contest._stages[stageID].contestPeriod).add(_contest._stages[stageID].votePeriod);
        uint256 endRevokeTimestamp = _contest._stages[stageID].endTimestampUtc;
        
        require(
            (
                (
                    (_contest._stages[stageID].active == true) && (endRevokeTimestamp > now) && (now >= endVoteTimestamp)
                )
            ), 
            "Stage is out of revoke period"
        );
        _;
    }
    
    modifier canClaim(uint256 stageID) {
        uint256 endTimestampUtc = _contest._stages[stageID].endTimestampUtc;
        require(
            (
                (
                    (_contest._stages[stageID].participants[_msgSender()].revoked == false) && 
                    (_contest._stages[stageID].participants[_msgSender()].claimed == false) && 
                    (_contest._stages[stageID].completed == true) && 
                    (_contest._stages[stageID].active == true) && 
                    (now > endTimestampUtc)
                )
            ), 
            "Stage have not completed or sender has already claimed or revoked"
        );
        _;
    }
    
    modifier inContestsList(uint256 stageID) {
        require(
             (_contest._stages[stageID].contestsList.contains(_msgSender())), 
            "Sender must be in contestant list"
        );
        _;
    }
    
    modifier notInContestsList(uint256 stageID) {
        require(
             (!_contest._stages[stageID].contestsList.contains(_msgSender())), 
            "Sender must not be in contestant list"
        );
        _;
    }
    
    modifier inPledgesList(uint256 stageID) {
        require(
             (_contest._stages[stageID].pledgesList.contains(_msgSender())), 
            "Sender must be in pledge list"
        );
        _;
    }
    modifier notInPledgesList(uint256 stageID) {
        require(
             (!_contest._stages[stageID].pledgesList.contains(_msgSender())), 
            "Sender must not be in pledge list"
        );
        _;
    }
    
    modifier inJudgesList(uint256 stageID) {
        require(
             (_contest._stages[stageID].judgesList.contains(_msgSender())), 
            "Sender must be in judges list"
        );
        _;
    }
    modifier notInJudgesList(uint256 stageID) {
        require(
             (!_contest._stages[stageID].judgesList.contains(_msgSender())), 
            "Sender must not be in judges list"
        );
        _;
    }
        
    modifier inPledgesOrJudgesList(uint256 stageID) {
        require(
             (
                 _contest._stages[stageID].pledgesList.contains(_msgSender()) ||
                 _contest._stages[stageID].judgesList.contains(_msgSender())
             )
             , 
            "Sender must be in pledges or judges list"
        );
        _;
    }  
    
    modifier canCompleted(uint256 stageID) {
         require(
            (
                (_contest._stages[stageID].completed == false) &&
                (_contest._stages[stageID].active == true) &&
                (_contest._stages[stageID].endTimestampUtc < now)
            ), 
            string("Last stage have not ended yet")
        );
        _;
    }
    ////
	// END of modifiers section 
	////

	/**
     * @param stagesCount count of stages for first Contest
     * @param stagesMinAmount array of minimum amount that need to reach at each stage
     * @param contestPeriodInSeconds duration in seconds  for contest period(exclude before reach minimum amount)
     * @param votePeriodInSeconds duration in seconds  for voting period
     * @param revokePeriodInSeconds duration in seconds  for revoking period
     * @param percentForWinners array of values in percentages of overall amount that will gain winners 
     * @param judges array of judges' addresses. if empty than everyone can vote
     * 
     */
    constructor (
        uint256 stagesCount,
        uint256[] memory stagesMinAmount,
        uint256 contestPeriodInSeconds,
        uint256 votePeriodInSeconds,
        uint256 revokePeriodInSeconds,
        uint256[] memory percentForWinners,
        address[] memory judges
    ) 
        public 
    {
        
        uint256 stage = 0;
        
        _contest.stage = 0;            
        for (stage = 0; stage < stagesCount; stage++) {
            _contest._stages[stage].minAmount = stagesMinAmount[stage];
            _contest._stages[stage].winnersLock = false;
            _contest._stages[stage].active = false;
            _contest._stages[stage].contestPeriod = contestPeriodInSeconds;
            _contest._stages[stage].votePeriod = votePeriodInSeconds;
            _contest._stages[stage].revokePeriod = revokePeriodInSeconds;
            
            for (uint256 i = 0; i < judges.length; i++) {
                _contest._stages[stage].judgesList.add(judges[i]);
            }
            
            for (uint256 i = 0; i < percentForWinners.length; i++) {
                _contest._stages[stage].percentForWinners.add(percentForWinners[i]);
            }
        }
        
        emit ContestStart();
        
    }

    ////
	// public section
	////
	/**
	 * @dev show contest state
	 * @param stageID Stage number
	 */
    function isContestOnline(uint256 stageID) public view returns (bool res){

        if (
            (_contest._stages[stageID].winnersLock == false) &&
            (
                (_contest._stages[stageID].active == false) ||
                ((_contest._stages[stageID].active == true) && (_contest._stages[stageID].endTimestampUtc > now))
            ) && 
            (_contest._stages[stageID].completed == false)
        ) {
            res = true;
        } else {
            res = false;
        }
    }

    /**
     * @param amount amount to pledge
	 * @param stageID Stage number
     */
    function pledge(uint256 amount, uint256 stageID) public virtual {
        _pledge(amount, stageID);
    }
    
    /**
     * @param judge address of judge which user want to delegate own vote
	 * @param stageID Stage number
     */
    function delegate(
        address judge, 
        uint256 stageID
    ) 
        public
        notInContestsList(stageID)
        stageNotCompleted(stageID)
        onlyNotVotedNotDelegated(_msgSender(), stageID)
        judgeNotDelegatedBefore(judge, stageID)
    {
        _delegate(judge, stageID);
    }
    
    /** 
     * @param contestantAddress address of contestant which user want to vote
	 * @param stageID Stage number
     */     
    function vote(
        address contestantAddress,
        uint256 stageID
    ) 
        public 
        notInContestsList(stageID)
        onlyNotVotedNotDelegated(_msgSender(), stageID)  
        stageNotCompleted(stageID)
        canDelegateAndVote(stageID)
    {
        _vote(contestantAddress, stageID);
    }
    
    /**
     * @param stageID Stage number
     */
    function claim(
        uint256 stageID
    )
        public
        inContestsList(stageID)
        canClaim(stageID)
    {
        _contest._stages[stageID].participants[_msgSender()].claimed = true;
        uint prizeAmount = _contest._stages[stageID].participants[_msgSender()].balanceAfter;
        _claimAfter(prizeAmount);
    }
    
    /**
     * @param stageID Stage number
     */
    function enter(
        uint256 stageID
    ) 
        notInContestsList(stageID) 
        notInPledgesList(stageID) 
        notInJudgesList(stageID) 

        public 
    {
        _enter(stageID);
    }
    
    /**
     * @param stageID Stage number
     */   
    function leave(
        uint256 stageID
    ) 
        public 
    {
        _leave(stageID);
    }
    
    /**
     * @param stageID Stage number
     */
    function revoke(
        uint256 stageID
    ) 
        public
        notInContestsList(stageID)
        stageNotCompleted(stageID)
        canRevoke(stageID)
    {
        
        _revoke(stageID);
        
        _contest._stages[stageID].participants[_msgSender()].revoked == true;
            
        uint revokedBalance = _contest._stages[stageID].participants[_msgSender()].balance;
        _contest._stages[stageID].amount = _contest._stages[stageID].amount.sub(revokedBalance);
        
        revokeAfter(revokedBalance.sub(revokedBalance.mul(revokeFee).div(1e6)));
    } 
    
    ////
	// internal section
	////
	/**
     * @param judge address of judge which user want to delegate own vote
     * @param stageID Stage number
     */
    function _delegate(
        address judge, 
        uint256 stageID
    ) 
        internal 
        canDelegateAndVote(stageID)
    {
        
        // code left for possibility re-delegate
        // if (_contests[contestID]._stages[stageID].participants[_msgSender()].delegated == true) {
        //     _revoke(stageID);
        // }
        _contest._stages[stageID].participants[_msgSender()].delegated = true;
        _contest._stages[stageID].participants[_msgSender()].delegateTo = judge;
        _contest._stages[stageID].participants[judge].delegatedBy.add(_msgSender());
    }
    
    /** 
     * @param contestantAddress address of contestant which user want to vote
	 * @param stageID Stage number
     */ 
    function _vote(
        address contestantAddress,
        uint256 stageID
    ) 
        internal
    {
           
        require(
            _contest._stages[stageID].contestsList.contains(contestantAddress), 
            "contestantAddress must be in contestant list"
        );
     
        // code left for possibility re-vote
        // if (_contests[contestID]._stages[stageID].participants[_msgSender()].voted == true) {
        //     _revoke(stageID);
        // }
        //----
        
        _contest._stages[stageID].participants[_msgSender()].voted = true;
        _contest._stages[stageID].participants[_msgSender()].voteTo = contestantAddress;
        _contest._stages[stageID].participants[contestantAddress].votedBy.add(_msgSender());
    }
    
    /**
     * @param amount amount 
     */
    function _claimAfter(uint256 amount) internal virtual { }
    
    /**
     * @param amount amount 
     */
    function revokeAfter(uint256 amount) internal virtual {}
    
    /** 
	 * @param stageID Stage number
     */ 
    function _revoke(
        uint256 stageID
    ) 
        private
    {
        address addr;
        if (_contest._stages[stageID].participants[_msgSender()].voted == true) {
            addr = _contest._stages[stageID].participants[_msgSender()].voteTo;
            _contest._stages[stageID].participants[addr].votedBy.remove(_msgSender());
        } else if (_contest._stages[stageID].participants[_msgSender()].delegated == true) {
            addr = _contest._stages[stageID].participants[_msgSender()].delegateTo;
            _contest._stages[stageID].participants[addr].delegatedBy.remove(_msgSender());
        } else {
            
        }
    }
    
    /**
     * @dev This method triggers the complete(stage), if it hasn't successfully been triggered yet in the contract. 
     * The complete(stage) method works like this: if stageBlockNumber[N] has not passed yet then reject. Otherwise it wraps up the stage as follows, and then increments 'stage':
     * @param stageID Stage number
     */
    function complete(uint256 stageID) public onlyOwner canCompleted(stageID) {
       _complete(stageID);
    }
  
	/**
	 * @dev need to be used after each pledge/enter
     * @param stageID Stage number
	 */
	function _turnStageToActive(uint256 stageID) internal {
	    
        if (
            (_contest._stages[stageID].active == false) && 
            (_contest._stages[stageID].amount >= _contest._stages[stageID].minAmount)
        ) {
            _contest._stages[stageID].active = true;
            // fill time
            _contest._stages[stageID].startTimestampUtc = now;
            _contest._stages[stageID].endTimestampUtc = (now)
                .add(_contest._stages[stageID].contestPeriod)
                .add(_contest._stages[stageID].votePeriod)
                .add(_contest._stages[stageID].revokePeriod);
            emit StageStartAnnounced(stageID);
        } else if (
            (_contest._stages[stageID].active == true) && 
            (_contest._stages[stageID].endTimestampUtc < now)
        ) {
            // run complete
	        _complete(stageID);
	    } else {
            
        }
        
	}
	
	/**
	 * @dev logic for ending stage (calculate weights, pick winners, reward losers, turn to next stage)
     * @param stageID Stage number
	 */
	function _complete(uint256 stageID) internal  {
	    emit StageCompleted(stageID);

	    _calculateWeights(stageID);
	    uint256 percentWinnersLeft = _rewardWinners(stageID);
	    _rewardLosers(stageID, percentWinnersLeft);
	 
	    //mark stage completed
	    _contest._stages[stageID].completed = true;
	    
	    // switch to next stage
	    if (_contest.stagesCount == stageID.add(1)) {
            // just complete if last stage 
            
            emit ContestComplete();
        } else {
            // increment stage
            _contest.stage = (_contest.stage).add(1);
        }
	}
	
	/**
	 * @param amount amount
     * @param stageID Stage number
	 */
    function _pledge(
        uint256 amount, 
        uint256 stageID
    ) 
        internal 
        canPledge(stageID) 
        notInContestsList(stageID) 
    {
        _createParticipant(stageID);
        
        _contest._stages[stageID].pledgesList.add(_msgSender());
        
        // accumalate balance in current stage
        _contest._stages[stageID].participants[_msgSender()].balance = (
            _contest._stages[stageID].participants[_msgSender()].balance
            ).add(amount);
            
        // accumalate overall stage balance
        _contest._stages[stageID].amount = (
            _contest._stages[stageID].amount
            ).add(amount);
        
        _turnStageToActive(stageID);

    }
    
    /**
     * @param stageID Stage number
	 */
    function _enter(
        uint256 stageID
    ) 
        internal 
        notInContestsList(stageID) 
        notInPledgesList(stageID) 
        notInJudgesList(stageID) 
    {
        _turnStageToActive(stageID);
        _createParticipant(stageID);
        _contest._stages[stageID].contestsList.add(_msgSender());
    }
    
    /**
     * @param stageID Stage number
	 */
    function _leave(
        uint256 stageID
    ) 
        internal 
        inContestsList(stageID) 
    {
        _contest._stages[stageID].contestsList.remove(_msgSender());
        _contest._stages[stageID].participants[msg.sender].active = false;
    }
    
    /**
     * @param stageID Stage number
	 */     
    function _createParticipant(uint256 stageID) internal {
        if (_contest._stages[stageID].participants[_msgSender()].active) {
             // ---
        } else {
            Participant memory p;
            _contest._stages[stageID].participants[_msgSender()] = p;
            _contest._stages[stageID].participants[_msgSender()].active = true;
        }
    }
    
	////
	// private section
	////
	
	/**
     * @param stageID Stage number
	 */
	function _calculateWeights(uint256 stageID) private {
	       
        // loop via contestsList 
        // find it in participant 
        //     loop via votedBy
        //         in each calculate weight
        //             if delegatedBy empty  -- sum him balance only
        //             if delegatedBy not empty -- sum weight inside all who delegated
        // make array of winners
        // set balanceAfter
	    
	    address addrContestant;
	    address addrVotestant;
	    address addrWhoDelegated;
	    
	    for (uint256 i = 0; i < _contest._stages[stageID].contestsList.length(); i++) {
	        addrContestant = _contest._stages[stageID].contestsList.at(i);
	        for (uint256 j = 0; j < _contest._stages[stageID].participants[addrContestant].votedBy.length(); j++) {
	            addrVotestant = _contest._stages[stageID].participants[addrContestant].votedBy.at(j);
	            
                // sum votes
                _contest._stages[stageID].participants[addrContestant].weight = 
                _contest._stages[stageID].participants[addrContestant].weight.add(
                    _contest._stages[stageID].participants[addrVotestant].balance
                );
                
                // sum all delegated if exists
                for (uint256 k = 0; k < _contest._stages[stageID].participants[addrVotestant].delegatedBy.length(); k++) {
                    addrWhoDelegated = _contest._stages[stageID].participants[addrVotestant].delegatedBy.at(k);
                    _contest._stages[stageID].participants[addrContestant].weight = 
	                _contest._stages[stageID].participants[addrContestant].weight.add(
	                    _contest._stages[stageID].participants[addrWhoDelegated].balance
	                );
                }
	             
	        }
	        
	    }
	}
	
	/**
     * @param stageID Stage number
	 * @return percentLeft percents left if count of winners more that prizes. in that cases left percent distributed to losers
	 */
	function _rewardWinners(uint256 stageID) private returns(uint256 percentLeft)  {
	    
        uint256 indexPrize = 0;
	    address addrContestant;
	    
	    uint256 lenContestList = _contest._stages[stageID].contestsList.length();
	    if (lenContestList>0)  {
	    
    	    uint256[] memory weight = new uint256[](lenContestList);
    
    	    for (uint256 i = 0; i < lenContestList; i++) {
    	        addrContestant = _contest._stages[stageID].contestsList.at(i);
                weight[i] = _contest._stages[stageID].participants[addrContestant].weight;
    	    }
    	    weight = sortAsc(weight);
    
            // dev Note: 
            // the original implementation is an infinite loop. When. i is 0 the loop decrements it again, 
            // but since it's an unsigned integer it undeflows and loops back to the maximum uint 
            // so use  "for (uint i = a.length; i > 0; i--)" and in code "a[i-1]" 
    	    for (uint256 i = weight.length; i > 0; i--) {
    	       for (uint256 j = 0; j < lenContestList; j++) {
    	            addrContestant = _contest._stages[stageID].contestsList.at(j);
    	            if (
    	                (weight[i-1] > 0) &&
    	                (_contest._stages[stageID].participants[addrContestant].weight == weight[i-1]) &&
    	                (_contest._stages[stageID].participants[addrContestant].won == false) &&
    	                (_contest._stages[stageID].participants[addrContestant].active == true) &&
    	                (_contest._stages[stageID].participants[addrContestant].revoked == false)
    	            ) {
    	                 
    	                _contest._stages[stageID].participants[addrContestant].balanceAfter = (_contest._stages[stageID].amount)
    	                    .mul(_contest._stages[stageID].percentForWinners.at(indexPrize))
    	                    .div(100);
                    
                        _contest._stages[stageID].participants[addrContestant].won = true;
                        
                        indexPrize++;
                        break;
    	            }
    	        }
    	        if (indexPrize >= _contest._stages[stageID].percentForWinners.length()) {
    	            break;
    	        }
    	    }
	    }
	    
	    percentLeft = 0;
	    if (indexPrize < _contest._stages[stageID].percentForWinners.length()) {
	       for (uint256 i = indexPrize; i < _contest._stages[stageID].percentForWinners.length(); i++) {
	           percentLeft = percentLeft.add(_contest._stages[stageID].percentForWinners.at(i));
	       }
	    }
	    return percentLeft;
	}
	
    /**
     * @param stageID Stage number
	 * @param prizeWinLeftPercent percents left if count of winners more that prizes. in that cases left percent distributed to losers
	 */
	function _rewardLosers(uint256 stageID, uint256 prizeWinLeftPercent) private {
	    // calculate left percent
	    // calculate howmuch participant loose
	    // calculate and apply left weight
	    address addrContestant;
	    uint256 leftPercent = 100;
	    
	    uint256 prizecount = _contest._stages[stageID].percentForWinners.length();
	    for (uint256 i = 0; i < prizecount; i++) {
	        leftPercent = leftPercent.sub(_contest._stages[stageID].percentForWinners.at(i));
	    }

	    leftPercent = leftPercent.add(prizeWinLeftPercent); 
	    
	    uint256 loserParticipants = 0;
	    if (leftPercent > 0) {
	        for (uint256 j = 0; j < _contest._stages[stageID].contestsList.length(); j++) {
	            addrContestant = _contest._stages[stageID].contestsList.at(j);
	            
	            if (
	                (_contest._stages[stageID].participants[addrContestant].won == false) &&
	                (_contest._stages[stageID].participants[addrContestant].active == true) &&
	                (_contest._stages[stageID].participants[addrContestant].revoked == false)
	            ) {
	                loserParticipants++;
	            }
	        }

	        if (loserParticipants > 0) {
	            uint256 rewardLoser = (_contest._stages[stageID].amount).mul(leftPercent).div(100).div(loserParticipants);
	            
	            for (uint256 j = 0; j < _contest._stages[stageID].contestsList.length(); j++) {
    	            addrContestant = _contest._stages[stageID].contestsList.at(j);
    	            
    	            if (
    	                (_contest._stages[stageID].participants[addrContestant].won == false) &&
    	                (_contest._stages[stageID].participants[addrContestant].active == true) &&
    	                (_contest._stages[stageID].participants[addrContestant].revoked == false)
    	            ) {
    	                _contest._stages[stageID].participants[addrContestant].balanceAfter = rewardLoser;
    	            }
    	        }
	        }
	    }
	}
    
    // useful method to sort native memory array 
    function sortAsc(uint256[] memory data) private returns(uint[] memory) {
       quickSortAsc(data, int(0), int(data.length - 1));
       return data;
    }
    
    function quickSortAsc(uint[] memory arr, int left, int right) private{
        int i = left;
        int j = right;
        if(i==j) return;
        uint pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] < pivot) i++;
            while (pivot < arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSortAsc(arr, left, j);
        if (i < right)
            quickSortAsc(arr, i, right);
    }

}