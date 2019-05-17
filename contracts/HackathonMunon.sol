pragma solidity 0.5.0;

library Library
{
  // Structs
  struct Event
  {
    uint id;
  }

  struct Participant
  {
    uint id;
    address addr;
  }

  struct Points
  {
    uint8 value;
  }
}

contract HackathonMunon
{
  // Public methods
  function createEvent() public returns(uint)
  {
    uint event_id = uint (events.length) + 1;
    events.push(Library.Event( event_id ));
    return event_id;
  }

  function join(uint event_id) public payable paysEntryFee hasNotJoined(event_id) returns(uint)
  {
    uint participant_id = uint (event_participants[event_id].length) + 1;
    event_participants[event_id].push(Library.Participant( participant_id, msg.sender ));
    return participant_id;
  }

  function rate(uint event_id, uint participant_id, uint8 points) public hasJoined(event_id) participantExists(event_id, participant_id) pointsAreValid(points)
  {
    reviews[msg.sender][participant_id] = Library.Points(points);
  }

  function cashOut(uint event_id) public hasJoined(event_id) returns(uint)
  {
    uint total_points = 0;
    uint my_points = 0;
    uint my_id = getParticipantId(event_id);

    // Calculate each participant total points
    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      address reviewer_addr = event_participants[event_id][i].addr;
      for (uint j = 0; j < event_participants[event_id].length; j++)
      {
        uint reviewed_id = event_participants[event_id][j].id;
        uint points = reviews[reviewer_addr][reviewed_id].value;
        total_points += points;
        if(my_id == reviewed_id)
          my_points += points;
      }
    }

    // Calculate reward
    uint total_pot = entry_fee * event_participants[event_id].length;
    uint my_percentage = my_points / total_points;
    uint my_reward = total_pot * my_percentage;

    msg.sender.transfer(my_reward);

    return my_reward;
  }

  // Public variables
  Library.Event[] public events;
  mapping(uint => Library.Participant[]) public event_participants;
  mapping(address  => mapping(uint  => Library.Points)) public reviews;
  uint entry_fee = 10 finney;

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee);
    _;
  }

  modifier hasNotJoined(uint event_id)
  {
    require(checkIfParticipantAddressExists(event_id, msg.sender) == false);
    _;
  }

  modifier hasJoined(uint event_id)
  {
    require(checkIfParticipantAddressExists(event_id, msg.sender) == true);
    _;
  }

  modifier participantExists(uint event_id, uint participant_id)
  {
    require(checkIfParticipantIdExists(event_id, participant_id) == true);
    _;
  }

  modifier pointsAreValid(uint8 points)
  {
    require(points <= 5);
    _;
  }

  // Internal funcions
  function checkIfParticipantAddressExists(uint event_id, address participant_addr) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      if(event_participants[event_id][i].addr == participant_addr)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }

  function checkIfParticipantIdExists(uint event_id, uint participant_id) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      if(event_participants[event_id][i].id == participant_id)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }

  function getParticipantId(uint event_id) internal view returns (uint)
  {
    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      if(event_participants[event_id][i].addr == msg.sender)
      {
        return event_participants[event_id][i].id;
      }
    }
    return 0;
  }
}
