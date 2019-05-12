pragma solidity 0.5.0;

library Library
{
  // Structs

  struct Participant
  {
    uint8 id;
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
  function join() public payable paysEntryFee hasNotJoined
  {
    participants.push(Library.Participant(uint8 (participants.length), msg.sender));
  }

  function rate(uint8 participant_id, uint8 points) public hasJoined participantExists(participant_id) pointsAreValid(points)
  {
    reviews[msg.sender][participant_id] = Library.Points(points);
  }

  function getParticipantPoints(uint8 participant_id) public view returns(uint8)
  {
    uint8 points_sum = 0;

    for (uint i = 0; i < participants.length; i++)
    {
      address reviewer_addr = participants[i].addr;
      for (uint j = 0; j < participants.length; j++)
      {
        uint8 reviewed_id = participants[j].id;
        if(reviewed_id == participant_id)
        {
          Library.Points memory points = reviews[reviewer_addr][reviewed_id];
          points_sum += points.value;
        }
      }
    }

    return points_sum;
  }

  // Public variables
  Library.Participant[] public participants;
  mapping(address  => mapping(uint8  => Library.Points)) public reviews;
  uint entry_fee = 10 finney;

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee);
    _;
  }

  modifier hasNotJoined()
  {
    require(checkIfParticipantAddressExists(msg.sender) == false);
    _;
  }

  modifier hasJoined()
  {
    require(checkIfParticipantAddressExists(msg.sender) == true);
    _;
  }

  modifier participantExists(uint8 participant_id)
  {
    require(checkIfParticipantIdExists(participant_id) == true);
    _;
  }

  modifier pointsAreValid(uint8 points)
  {
    require(points <= 5);
    _;
  }

  // Internal funcions
  function checkIfParticipantAddressExists(address participant_addr) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < participants.length; i++)
    {
      if(participants[i].addr == participant_addr)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }

  function checkIfParticipantIdExists(uint8 participant_id) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < participants.length; i++)
    {
      if(participants[i].id == participant_id)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }
}
