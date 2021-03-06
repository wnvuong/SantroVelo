var santroVeloApp = angular.module('santroVelo', []);

var basePath = 'https://santro-velo.herokuapp.com';
// var basePath = 'http://localhost:5000';
// var database = '?database=william_test';
var database = '';

santroVeloApp.controller('MainController', function ($scope, $http) {
  $scope.members = [];

  $scope.getPhoneString = getPhoneString;
  $scope.getValidString = getValidString;
  $scope.getDateString = getDateString;

  $scope.addMember = addMember;
  $scope.updateMember = updateMember;
  $scope.deleteMember = deleteMember;
  $scope.setMemberToDelete = setMemberToDelete;

  $scope.isNumeric = isNumeric;
  $scope.isPhoneValid = isPhoneValid;
  
  $scope.resetAddMemberForm = resetAddMemberForm;
  $scope.resetEditMemberForm = resetEditMemberForm;
  $scope.setOrderByAttribute = setOrderByAttribute;

  $scope.setEditMemberDetails = setEditMemberDetails;
  $scope.resetEditMemberDetails = resetEditMemberDetails;

  $scope.addMemberDetails = {};
  $scope.editMemberDetails = {};

  $scope.memberToDelete = {};

  $scope.orderByAttribute = '+id';

  getMembers();

  function getMembers() {
    $http.get(basePath + '/users' + database).
      success(function(data, status, headers, config) {
        console.log(data);

        data.message.forEach(function(elem, index) {
          elem.datejoinedString = getDateString(elem.datejoined);
          elem.validString = getValidString(elem.valid);
          elem.phoneString = getPhoneString(elem.phone);
        });

        $scope.members = data.message;
      }).
      error(function(data, status, headers, config) {
        console.log('Getting all users error');
        console.log(data);
      });
  }

  function getPhoneString(phoneNumber) {
    var phoneString = '';

    phoneString += '(' + phoneNumber.substring(0, 3) + ')';
    phoneString += ' ' + phoneNumber.substring(3, 6);
    phoneString += '-' + phoneNumber.substring(6, 10);
    return phoneString;
  }

  function getValidString(validBoolean) {
    if (validBoolean == true) {
      return 'Yes';
    } else {
      return 'No';
    }
  }

  function getDateString(dateObject) {
    var date = new Date(dateObject);

    var month = parseInt(date.getMonth()) + 1;

    return date.getFullYear() + '-' + month  + '-' + date.getDate();
  }

  function getMemberQueryString(newMember) {
    var query;
    if (database == '') {
      query = '?';
    } else {
      query = '&';
    }

    var properties = [];
    for (var key in newMember) {
      if (newMember.hasOwnProperty(key)) {
        properties.push(key);
      }
    }

    properties.forEach(function(elem, index) {
      query += elem + '=' + newMember[elem];
      if (index < properties.length - 1) {
        query +='&'
      }
    });

    return query;
  }

  function addMember(isValid) {

    var newMember = {
      firstname : $scope.addMemberDetails.firstname,
      lastname : $scope.addMemberDetails.lastname,
      datejoined : getDateString($scope.addMemberDetails.datejoined),
      phone : $scope.addMemberDetails.phone,
      valid : $scope.addMemberDetails.valid,
      amount: $scope.addMemberDetails.amount
    };

    var query = getMemberQueryString(newMember);

    console.log(query);

    $http.post(basePath + '/users' + database + query, $scope.addMemberDetails).
      success(function(data, status, headers, config) {
        console.log(data);
        getMembers();
      }).
      error(function(data, status, headers, config) {
        console.log('Adding new user error');
        console.log(data);
      });
  }

  function updateMember(member) {

    var currMember = {
      firstname : member.firstname,
      lastname : member.lastname,
      datejoined : getDateString(member.datejoined),
      phone : member.phone,
      valid : member.valid,
      amount : member.amount
    };

    var query = getMemberQueryString(currMember);
    console.log(query);

    $http.put(basePath + '/users/' + member.id + database + query).
      success(function(data, status, headers, config) {
        console.log(data);

        if (member.memberRefInList != null) {
          var index = $scope.members.indexOf(member.memberRefInList);
          
          member.datejoinedString = getDateString(member.datejoined);
          member.validString = getValidString(member.valid);
          member.phoneString = getPhoneString(member.phone);

          $scope.members[index] = member; 

        }
      }).
      error(function(data, status, headers, config) {
        console.log('Error updateding member');
      });
  }

  function deleteMember(member) {
    $http.delete(basePath + '/users/' + member.id).
    success(function(data, status, headers, config) {
      console.log(data);
      var index = $scope.members.indexOf(member);
      if (index > -1) {
        $scope.members.splice(index, 1);
      }
      // remove form memers array
    }).
    error(function(data, status, headers, config) {
      console.log('Deleting user error');
      console.log(data);
    });
  }

  function resetAddMemberForm() {
    $scope.addMemberDetails = {};
    $scope.addMemberForm.$setPristine();
  }

  function resetEditMemberForm() {
    $scope.editMemberDetails = {};
    $scope.editMemberForm.$setPristine();
  }

  function isPhoneValid(string) {
    var status = {
      error : false,
      warning : false,
      success : false
    }

    if (string == null) {
      status.error = true;
      return status;
    }

    if (string.length != 10) {
      status.warning = true;
      return status;
    }

    if (!isNumeric(string)) {
      status.error = true;
      return status;
    }

    status.success = true;
    return status;
  }

  function setOrderByAttribute(attr) {
    switch (attr) {
      case 'id':
        if ($scope.orderByAttribute == '+id') {
          $scope.orderByAttribute = '-id';
        } else if($scope.orderByAttribute == '-id') {
          $scope.orderByAttribute = '+id';
        } else {
          $scope.orderByAttribute = '+id';
        }
        break;

      case 'firstname':
        if ($scope.orderByAttribute == '+firstname') {
          $scope.orderByAttribute = '-firstname';
        } else if ($scope.orderByAttribute == '-firstname') {
          $scope.orderByAttribute = '+firstname';
        } else {
          $scope.orderByAttribute = '+firstname';
        }
        break;

      case 'datejoined':
        if ($scope.orderByAttribute == '+datejoined') {
          $scope.orderByAttribute = '-datejoined';
        } else if ($scope.orderByAttribute == '-datejoined') {
          $scope.orderByAttribute = '+datejoined';
        } else {
          $scope.orderByAttribute = '+datejoined';
        }

        break;
      case 'phone':
        if ($scope.orderByAttribute == '+phone') {
          $scope.orderByAttribute = '-phone';
        } else if ($scope.orderByAttribute == '-phone') {
          $scope.orderByAttribute = '+phone';
        } else {
          $scope.orderByAttribute = '+phone';
        }

        break;

      case 'valid':
        if ($scope.orderByAttribute == '+valid') {
          $scope.orderByAttribute = '-valid';
        } else if ($scope.orderByAttribute == '-valid') {
          $scope.orderByAttribute = '+valid';
        } else {
          $scope.orderByAttribute = '+valid';
        }

        break;

      case 'amount':
        if ($scope.orderByAttribute == '+amount') {
          $scope.orderByAttribute = '-amount';
        } else if ($scope.orderByAttribute == '-amount') {
          $scope.orderByAttribute = '+amount';
        } else {
          $scope.orderByAttribute = '+amount';
        }
    }
  }

  function isNumeric(string) {
    return !isNaN(string);
  }

  function setEditMemberDetails(member) {
    $scope.editMemberDetails = Object.create(member);
    $scope.editMemberDetails.memberRefInList = member;

    var dateArray = $scope.editMemberDetails.datejoinedString.split('-');
    $scope.editMemberDetails.datejoined = new Date(dateArray[0], dateArray[1], dateArray[2], 0, 0, 0, 0);

    $scope.editMemberDetails.terms = true;
    $scope.editMemberDetails.amount = parseFloat($scope.editMemberDetails.amount.split('$')[1]);
  }

  function setMemberToDelete(member) {
    $scope.memberToDelete = member;
  }

  function resetEditMemberDetails() {
    $scope.editMemberDetails = {};
  }
});